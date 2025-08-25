# LangChain Integration Backend API

This FastAPI backend replicates the functionality from the Streamlit implementation (`connect_memory_with_llm.py` and `create_memory_for_llm.py`) and provides REST API endpoints for the React frontend.

## Features

- **Chat API**: Process user queries using RetrievalQA with Groq LLM
- **Vector Store**: Connect to existing Pinecone vector store
- **Health Check**: Monitor API status
- **CORS Support**: Ready for React frontend integration

## Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   - Copy `env.template` to `.env`
   - Fill in your API keys:
     - `GROQ_API_KEY`: Get from [Groq Console](https://console.groq.com/keys)
     - `PINECONE_API_KEY`: Get from [Pinecone](https://www.pinecone.io/)

3. **Ensure Vector Store Exists**:
   - Make sure you've run `create_memory_for_llm.py` first to create the Pinecone index
   - The API expects the index name: `langchain-integration-index`

## Running the API

```bash
cd backend
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **Base URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## API Endpoints

### POST /api/chat
Process user queries and return responses with source documents.

**Request**:
```json
{
  "query": "What is diabetes?"
}
```

**Response**:
```json
{
  "result": "Based on the medical documents...",
  "source_documents": [
    {
      "page_content": "Excerpt from document...",
      "metadata": {"source": "document.pdf", "page": 1}
    }
  ]
}
```

### GET /api/health
Check API health status.

**Response**:
```json
{
  "status": "healthy",
  "message": "LangChain Integration API is running"
}
```

## Architecture

- `main.py`: FastAPI application with routes
- `services/vector_service.py`: Vector store management
- `services/llm_service.py`: LLM and RetrievalQA chain logic

## Frontend Integration

The API is configured to work with the React frontend on ports 3000 and 5173 (Vite dev server). The `api.js` service in the frontend will automatically connect to this backend.
