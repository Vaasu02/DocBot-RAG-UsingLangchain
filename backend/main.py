
from datetime import timedelta
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uvicorn
from sqlalchemy.orm import Session

from services.vector_service import VectorStoreService
from services.llm_service import LLMService
from services.document_processor import DocumentProcessor
from services.auth_service import AuthService, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db, engine, Base
from models import User

# Load environment variables
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

app = FastAPI(title="DocBot AI API", version="1.0.0")

# Create database tables
Base.metadata.create_all(bind=engine)

# Security
security = HTTPBearer()

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],  # Vite dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    query: str


class SourceDocument(BaseModel):
    page_content: str
    metadata: dict


class ChatResponse(BaseModel):
    result: str
    source_documents: List[dict]


class UploadResponse(BaseModel):
    success: bool
    message: str
    details: Optional[dict] = None
    error: Optional[str] = None


class IndexListResponse(BaseModel):
    success: bool
    indexes: List[str]
    error: Optional[str] = None


class SwitchIndexRequest(BaseModel):
    index_name: str


# Authentication models
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool


# Initialize services
vector_service = VectorStoreService()
llm_service = LLMService()
document_processor = DocumentProcessor()


# Authentication dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    username = AuthService.verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = AuthService.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "DocBot AI API is running"}


# Authentication endpoints
@app.post("/api/auth/signup", response_model=UserResponse)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """User registration"""
    # Check if user already exists
    if AuthService.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    if AuthService.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
        )

    # Create new user
    user = AuthService.create_user(
        db=db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
    )

    return UserResponse(
        id=user.id, username=user.username, email=user.email, is_active=user.is_active
    )


@app.post("/api/auth/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """User login"""
    user = AuthService.authenticate_user(
        db, user_credentials.email, user_credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
    )


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    """
    Chat endpoint that processes user queries using the vector store and LLM
    Replicates the functionality from connect_memory_with_llm.py
    """
    try:
        # Get vector store
        vectorstore = vector_service.get_vectorstore()
        if vectorstore is None:
            raise HTTPException(status_code=500, detail="Failed to load vector store")

        # Get LLM response using the RetrievalQA chain
        response = llm_service.get_response(request.query, vectorstore)

        # Format source documents for frontend
        source_docs = []
        if "source_documents" in response:
            for doc in response["source_documents"]:
                source_docs.append(
                    {
                        "page_content": (
                            doc.page_content[:200] + "..."
                            if len(doc.page_content) > 200
                            else doc.page_content
                        ),
                        "metadata": doc.metadata,
                    }
                )

        return ChatResponse(result=response["result"], source_documents=source_docs)

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.post("/api/upload", response_model=UploadResponse)
def upload_document(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user)
):
    """
    Upload and process a PDF document
    """
    try:
        # Check file type
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        # Check file size (limit to 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400, detail="File size too large. Maximum 10MB allowed"
            )

        # Read file content
        file_content = file.file.read()

        # Process the document
        result = document_processor.process_pdf_file(file_content, file.filename)

        if result["success"]:
            return UploadResponse(
                success=True, message=result["message"], details=result["details"]
            )
        else:
            return UploadResponse(
                success=False,
                message="Failed to process document",
                error=result["error"],
            )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error uploading document: {str(e)}"
        )


@app.get("/api/indexes", response_model=IndexListResponse)
def get_indexes(current_user: User = Depends(get_current_user)):
    """
    Get list of available document indexes
    """
    try:
        result = document_processor.get_available_indexes()
        if result["success"]:
            return IndexListResponse(success=True, indexes=result["indexes"])
        else:
            return IndexListResponse(success=False, indexes=[], error=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching indexes: {str(e)}")


@app.post("/api/switch-index")
def switch_index(
    request: SwitchIndexRequest, current_user: User = Depends(get_current_user)
):
    """
    Switch to a different document index for chat
    """
    try:
        # Update the vector service to use the new index
        vector_service.switch_index(request.index_name)
        return {"success": True, "message": f"Switched to index: {request.index_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error switching index: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "LangChain Integration API", "docs_url": "/docs"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
