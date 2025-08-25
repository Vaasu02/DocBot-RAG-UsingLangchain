import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from services.vector_service import VectorStoreService
from services.llm_service import LLMService
from services.document_processor import DocumentProcessor

# Load environment variables
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

app = FastAPI(title="LangChain Integration API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite dev server ports
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

# Initialize services
vector_service = VectorStoreService()
llm_service = LLMService()
document_processor = DocumentProcessor()

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "LangChain Integration API is running"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
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
                source_docs.append({
                    "page_content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata
                })
        
        return ChatResponse(
            result=response["result"],
            source_documents=source_docs
        )
    
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/api/upload", response_model=UploadResponse)
def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a PDF document
    """
    try:
        # Check file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Check file size (limit to 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large. Maximum 10MB allowed")
        
        # Read file content
        file_content = file.file.read()
        
        # Process the document
        result = document_processor.process_pdf_file(file_content, file.filename)
        
        if result["success"]:
            return UploadResponse(
                success=True,
                message=result["message"],
                details=result["details"]
            )
        else:
            return UploadResponse(
                success=False,
                message="Failed to process document",
                error=result["error"]
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@app.get("/api/indexes", response_model=IndexListResponse)
def get_indexes():
    """
    Get list of available document indexes
    """
    try:
        result = document_processor.get_available_indexes()
        if result["success"]:
            return IndexListResponse(
                success=True,
                indexes=result["indexes"]
            )
        else:
            return IndexListResponse(
                success=False,
                indexes=[],
                error=result["error"]
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching indexes: {str(e)}")

@app.post("/api/switch-index")
def switch_index(request: SwitchIndexRequest):
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
