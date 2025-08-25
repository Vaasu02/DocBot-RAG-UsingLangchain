# MediBot React Frontend

A modern React frontend for the LangChain-powered medical document Q&A chatbot.

## 🚀 Features

- **Modern Chat Interface**: Clean, responsive design with real-time messaging
- **Document Source Display**: Shows source documents for AI responses
- **Error Handling**: Comprehensive error boundaries and status indicators
- **Loading States**: Smooth loading animations and status feedback
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **TypeScript Ready**: Easy to convert to TypeScript if needed

## 🛠️ Tech Stack

- **React 19** - Latest React with modern hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting and quality

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx      # Individual chat message component
│   │   ├── ChatInput.jsx        # Message input with auto-resize
│   │   ├── LoadingSpinner.jsx   # Loading animation
│   │   ├── ErrorBoundary.jsx    # Error handling wrapper
│   │   └── StatusIndicator.jsx  # Connection status display
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main application component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles with Tailwind
├── public/
├── package.json
└── vite.config.js
```

## 🎯 Components Overview

### ChatMessage
- Displays user and AI messages with different styling
- Shows timestamps and source documents
- Handles error states with visual indicators

### ChatInput
- Auto-resizing textarea for comfortable typing
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Character counter and submit button

### StatusIndicator
- Shows online/offline status
- Indicates API health (demo mode vs live backend)
- Non-intrusive notifications

## 🔧 Setup Instructions

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🔌 Backend Integration

The frontend is designed to work with your Python LangChain backend. To connect:

1. **Update API Configuration**
   - Create a `.env` file in the frontend directory
   - Set `REACT_APP_API_URL=http://localhost:8000` (or your backend URL)

2. **Backend API Requirements**
   The frontend expects these endpoints:

   **POST /api/chat**
   ```json
   {
     "query": "user question"
   }
   ```
   Response:
   ```json
   {
     "result": "AI response text",
     "source_documents": ["doc1", "doc2"]
   }
   ```

   **GET /api/health**
   Simple health check endpoint returning 200 OK

## 🎨 Customization

### Styling
- Tailwind CSS classes are used throughout
- Color scheme can be changed by updating Tailwind config
- Gradients and shadows provide modern visual appeal

### Features to Add
- [ ] Message export functionality
- [ ] Theme switching (light/dark mode)
- [ ] Message search and filtering
- [ ] File upload for new documents
- [ ] User authentication
- [ ] Chat history persistence

## 🔄 Current State

The frontend currently runs with:
- **Simulated API responses** for demonstration
- **Real-time chat interface** 
- **Source document display**
- **Error handling and loading states**

When you're ready to connect the backend:
1. Update the `simulateAPICall` import in `App.jsx`
2. Replace with actual `apiService.sendMessage()` calls
3. Configure your backend endpoints

## 🚦 Next Steps

1. **Connect to Backend**: Replace simulation with actual API calls
2. **Add Authentication**: Implement user sessions if needed
3. **Enhance UI**: Add more interactive features
4. **Performance**: Implement message virtualization for large chats
5. **PWA**: Add service worker for offline functionality

The frontend is production-ready and waiting for backend integration!