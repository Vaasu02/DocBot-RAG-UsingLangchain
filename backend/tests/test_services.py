import os
from unittest.mock import patch, MagicMock
from services.vector_service import VectorStoreService
from services.llm_service import LLMService
from services.document_processor import DocumentProcessor


class TestVectorService:
    """Test Vector Store Service"""

    def test_init(self):
        """Test VectorStoreService initialization"""
        service = VectorStoreService()
        assert service._vectorstore is None
        assert service._current_index == "langchain-integration-index"

    def test_switch_index(self):
        """Test switching index"""
        service = VectorStoreService()
        service.switch_index("test-index")
        assert service._current_index == "test-index"
        assert service._vectorstore is None


class TestLLMService:
    """Test LLM Service"""

    def test_init(self):
        """Test LLMService initialization"""
        service = LLMService()
        assert service.custom_prompt_template is not None
        assert "context" in service.custom_prompt_template
        assert "question" in service.custom_prompt_template

    def test_update_prompt_template(self):
        """Test updating prompt template"""
        service = LLMService()
        new_template = "New template with {context} and {question}"
        service.update_prompt_template(new_template)
        assert service.custom_prompt_template == new_template


class TestDocumentProcessor:
    """Test Document Processor"""

    def test_init(self):
        """Test DocumentProcessor initialization"""
        processor = DocumentProcessor()
        assert processor.embedding_model is None

    @patch("services.document_processor.Pinecone")
    def test_get_available_indexes(self, mock_pinecone):
        """Test getting available indexes"""
        # Mock the Pinecone client
        mock_client = MagicMock()
        mock_index = MagicMock()
        mock_index.name = "test-index"
        mock_client.list_indexes.return_value = [mock_index]
        mock_pinecone.return_value = mock_client

        processor = DocumentProcessor()

        with patch.dict(os.environ, {"PINECONE_API_KEY": "test-key"}):
            result = processor.get_available_indexes()
            assert result["success"] is True
            assert "test-index" in result["indexes"]
