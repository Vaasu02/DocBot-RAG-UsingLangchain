import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from functools import lru_cache

class VectorStoreService:
    """
    Vector Store Service that replicates the get_vectorstore() functionality
    from connect_memory_with_llm.py
    """
    
    def __init__(self):
        self._vectorstore = None
        self._embedding_model = None
        self._current_index = "langchain-integration-index"  # Default index
    
    @lru_cache(maxsize=1)
    def _get_embedding_model(self):
        """Get the embedding model (cached for performance)"""
        if self._embedding_model is None:
            self._embedding_model = HuggingFaceEmbeddings(
                model_name='sentence-transformers/all-MiniLM-L6-v2'
            )
        return self._embedding_model
    
    def get_vectorstore(self):
        """
        Get the vector store from existing Pinecone index
        Replicates the @st.cache_resource get_vectorstore() function
        """
        if self._vectorstore is None:
            try:
                # Initialize embedding model (same as used in create_memory_for_llm.py)
                embedding_model = self._get_embedding_model()
                
                # Use current index name
                index_name = self._current_index
                
                # Create vector store from existing index
                self._vectorstore = PineconeVectorStore(
                    index_name=index_name,
                    embedding=embedding_model
                )
                
            except Exception as e:
                print(f"Error initializing vector store: {str(e)}")
                return None
        
        return self._vectorstore
    
    def switch_index(self, index_name):
        """Switch to a different Pinecone index"""
        self._current_index = index_name
        self._vectorstore = None  # Reset to force reload with new index
    
    def get_current_index(self):
        """Get the current index name"""
        return self._current_index
    
    def reset_vectorstore(self):
        """Reset the cached vector store (useful for testing)"""
        self._vectorstore = None
