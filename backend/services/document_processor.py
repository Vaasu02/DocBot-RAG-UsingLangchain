import os
import tempfile

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
import hashlib
import time


class DocumentProcessor:
    """
    Service to process uploaded PDF documents and add them to vector store
    """

    def __init__(self):
        self.embedding_model = None

    def _get_embedding_model(self):
        """Get the embedding model (cached for performance)"""
        if self.embedding_model is None:
            self.embedding_model = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
        return self.embedding_model

    def _create_or_get_index(self, index_name):
        """Create or get existing Pinecone index"""
        try:
            pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

            # Check if index exists
            if not pc.has_index(index_name):
                print(f"Creating new index: {index_name}")
                pc.create_index(
                    name=index_name,
                    dimension=384,  # dimension for all-MiniLM-L6-v2
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
                )
                # Wait for index creation
                time.sleep(30)

            return True
        except Exception as e:
            print(f"Error creating/accessing index: {str(e)}")
            return False

    def process_pdf_file(self, file_content, filename, user_index_name=None):
        """
        Process uploaded PDF file and add to vector store

        Args:
            file_content: Binary content of the PDF file
            filename: Name of the uploaded file
            user_index_name: Optional custom index name for user's documents

        Returns:
            dict: Processing result with success status and details
        """
        try:
            # Create a temporary file to save the uploaded content
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name

            try:
                # Load PDF document
                loader = PyPDFLoader(temp_file_path)
                documents = loader.load()

                if not documents:
                    return {"success": False, "error": "No content found in PDF file"}

                # Add filename metadata to all documents
                for doc in documents:
                    doc.metadata["source"] = filename
                    doc.metadata["upload_timestamp"] = time.time()

                # Create text chunks
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500, chunk_overlap=50
                )
                text_chunks = text_splitter.split_documents(documents)

                # Generate index name based on filename if not provided
                if user_index_name is None:
                    # Create a hash of filename for unique index name
                    file_hash = hashlib.md5(filename.encode()).hexdigest()[:8]
                    index_name = f"user-docs-{file_hash}"
                else:
                    index_name = user_index_name

                # Create or get the index
                if not self._create_or_get_index(index_name):
                    return {
                        "success": False,
                        "error": "Failed to create/access vector store index",
                    }

                # Add documents to vector store
                embedding_model = self._get_embedding_model()
                PineconeVectorStore.from_documents(
                    documents=text_chunks,
                    index_name=index_name,
                    embedding=embedding_model,
                )

                return {
                    "success": True,
                    "message": f"Successfully processed {filename}",
                    "details": {
                        "filename": filename,
                        "total_pages": len(documents),
                        "text_chunks": len(text_chunks),
                        "index_name": index_name,
                    },
                }

            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)

        except Exception as e:
            return {"success": False, "error": f"Error processing PDF: {str(e)}"}

    def get_available_indexes(self):
        """Get list of available Pinecone indexes"""
        try:
            pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
            indexes = pc.list_indexes()
            return {"success": True, "indexes": [index.name for index in indexes]}
        except Exception as e:
            return {"success": False, "error": f"Error fetching indexes: {str(e)}"}
