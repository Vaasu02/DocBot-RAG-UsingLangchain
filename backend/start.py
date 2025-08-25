#!/usr/bin/env python3
"""
Startup script for the LangChain Integration Backend API
"""
import os
import sys
import subprocess
from pathlib import Path

def check_env_file():
    """Check if .env file exists, create from template if not"""
    env_file = Path(".env")
    template_file = Path("env.template")
    
    if not env_file.exists() and template_file.exists():
        print("⚠️  .env file not found. Creating from template...")
        template_file.read_text().replace(template_file.name, env_file.name)
        with open(env_file, 'w') as f:
            f.write(template_file.read_text())
        print(f"📝 Created {env_file}. Please fill in your API keys before running the server.")
        return False
    
    if not env_file.exists():
        print("❌ .env file not found and no template available.")
        print("Please create a .env file with your API keys:")
        print("GROQ_API_KEY=your_groq_api_key")
        print("PINECONE_API_KEY=your_pinecone_api_key")
        return False
    
    return True

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import fastapi
        import uvicorn
        print("✅ Dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting LangChain Integration Backend API...")
    
    # Change to backend directory
    os.chdir(Path(__file__).parent)
    
    # Check environment file
    if not check_env_file():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Start the server
    print("🌐 Starting FastAPI server on http://localhost:8000")
    print("📚 API Documentation available at http://localhost:8000/docs")
    print("🔍 Health check at http://localhost:8000/api/health")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
