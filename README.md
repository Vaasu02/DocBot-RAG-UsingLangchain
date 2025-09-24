# DocBot AI - Containerized AI-powered Document Chatbot

A modern, containerized AI-powered document chatbot built with FastAPI backend and React frontend, leveraging LangChain for RAG (Retrieval-Augmented Generation) capabilities.

## 🚀 Features

### Backend (FastAPI)
- **RAG Implementation**: Advanced document processing with LangChain
- **Vector Storage**: Pinecone integration for semantic search
- **LLM Integration**: Groq API with Llama models for fast inference
- **Authentication**: JWT-based user authentication with SQLAlchemy
- **Document Processing**: PDF upload and text extraction
- **Multi-Index Support**: Switch between different document collections
- **RESTful API**: Clean, documented API endpoints

### Frontend (React)
- **Modern Chat Interface**: Real-time messaging with beautiful UI
- **Document Management**: Upload PDFs and manage document collections
- **Authentication**: Secure login/signup with JWT tokens
- **Source Attribution**: Shows source documents for AI responses
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Comprehensive error boundaries and notifications

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - RAG and LLM orchestration
- **Pinecone** - Vector database for embeddings
- **Groq** - High-performance LLM inference
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **Pydantic** - Data validation

### Frontend
- **React 19** - Latest React with modern hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

## 📁 Project Structure

```
DocBot-RAG-UsingLangchain/
├── backend/
│   ├── services/
│   │   ├── auth_service.py      # User authentication
│   │   ├── document_processor.py # PDF processing
│   │   ├── llm_service.py       # LLM integration
│   │   └── vector_service.py    # Vector store management
│   ├── main.py                  # FastAPI application
│   ├── models.py                # Database models
│   ├── database.py              # Database configuration
│   ├── requirements.txt         # Python dependencies
│   └── tests/                   # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API services
│   │   └── App.jsx             # Main application
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Vite configuration
├── docker-compose.yml          # Container orchestration
├── Dockerfile                  # Multi-stage Docker build
└── README.md                   # This file
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DocBot-RAG-UsingLangchain
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@db:5432/docbot_db

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# Groq API
GROQ_API_KEY=your_groq_api_key

# JWT Secret
SECRET_KEY=your_jwt_secret_key

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

## 🔧 Development Setup

### Backend Development

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Chat Endpoints

- `POST /api/chat` - Send message to AI (requires authentication)
- `GET /api/health` - Health check

### Document Management

- `POST /api/upload` - Upload PDF document
- `GET /api/indexes` - List available document indexes
- `POST /api/switch-index` - Switch to different document collection

### Example API Usage

```bash
# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Chat (with JWT token)
curl -X POST "http://localhost:8000/api/chat" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is machine learning?"}'
```

## 🎯 Key Features Explained

### RAG Implementation
- Documents are processed and split into chunks
- Chunks are embedded using HuggingFace sentence transformers
- Embeddings are stored in Pinecone vector database
- Queries are embedded and matched against stored vectors
- Relevant chunks are retrieved and passed to LLM for response generation

### Authentication Flow
- Users register with email/password
- Passwords are hashed using bcrypt
- JWT tokens are issued for authenticated sessions
- All protected endpoints require valid JWT tokens

### Document Processing
- PDF files are uploaded and processed
- Text is extracted and split into semantic chunks
- Chunks are embedded and stored in Pinecone
- Multiple document collections (indexes) are supported

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Production Deployment

### Using Docker Compose (Recommended)

1. **Set up production environment variables**
2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Backend**: Deploy FastAPI app with Gunicorn/Uvicorn
2. **Frontend**: Build React app and serve with Nginx
3. **Database**: Set up PostgreSQL instance
4. **Vector Store**: Configure Pinecone index

## 🔒 Security Considerations

- JWT tokens with expiration
- Password hashing with bcrypt
- CORS configuration for frontend
- Input validation with Pydantic
- File upload size limits
- Environment variable protection

## 📈 Performance Optimization

- Vector store caching with LRU cache
- Embedding model caching
- Database connection pooling
- Frontend code splitting
- API response compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Pinecone Connection Error**
   - Verify API key and environment
   - Check network connectivity

2. **Groq API Error**
   - Verify API key is valid
   - Check rate limits

3. **Database Connection Error**
   - Verify DATABASE_URL format
   - Ensure PostgreSQL is running

4. **Frontend Build Error**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Getting Help

- Check the API documentation at `/docs`
- Review the logs in Docker containers
- Open an issue on GitHub

## 🔮 Future Enhancements

- [ ] Support for more document formats (DOCX, TXT, etc.)
- [ ] Advanced search filters
- [ ] Chat history persistence
- [ ] Multi-language support
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with cloud storage services

---

