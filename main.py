"""
Caliber Food Classification & Health Chatbot - Integrated Application
Runs both Backend (FastAPI) and serves Frontend (React build)
"""
from __future__ import annotations
import os
import sys
import subprocess
import webbrowser
from pathlib import Path
from threading import Thread, Timer
import time

# Add backend to Python path
BACKEND_DIR = Path(__file__).parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# Import the FastAPI app from backend
from backend.app import app
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# Configuration
HOST = "127.0.0.1"
PORT = 5000
FRONTEND_DIR = Path(__file__).parent / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"


def build_frontend():
    """Build React frontend if not already built or outdated"""
    print("\n" + "="*60)
    print("🔨 Checking Frontend Build...")
    print("="*60)
    
    # Check if dist folder exists and is recent
    if FRONTEND_DIST.exists():
        dist_time = FRONTEND_DIST.stat().st_mtime
        src_dir = FRONTEND_DIR / "src"
        
        # Check if any source file is newer than dist
        needs_rebuild = False
        if src_dir.exists():
            for src_file in src_dir.rglob("*"):
                if src_file.is_file() and src_file.stat().st_mtime > dist_time:
                    needs_rebuild = True
                    break
        
        if not needs_rebuild:
            print("✅ Frontend already built and up to date!")
            return True
    
    print("📦 Building frontend (this may take a minute)...")
    
    # Check if node_modules exists
    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists():
        print("📥 Installing npm dependencies...")
        try:
            subprocess.run(
                ["npm", "install"],
                cwd=FRONTEND_DIR,
                check=True,
                capture_output=True
            )
            print("✅ Dependencies installed!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
    
    # Build the frontend
    try:
        subprocess.run(
            ["npm", "run", "build"],
            cwd=FRONTEND_DIR,
            check=True,
            capture_output=True
        )
        print("✅ Frontend built successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend build failed: {e}")
        return False


def setup_static_files():
    """Mount static files and setup catch-all route for React Router"""
    if not FRONTEND_DIST.exists():
        print("⚠️  Frontend dist folder not found. Skipping static file serving.")
        print(f"   Expected at: {FRONTEND_DIST}")
        return
    
    # Serve static files from dist
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")
    
    # Catch-all route for React Router (must be after all API routes)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React app for all non-API routes"""
        # Serve index.html for all routes (React Router handles routing)
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "Frontend not built. Run 'npm run build' in frontend/"}
    
    print("✅ Static file serving configured")


def open_browser():
    """Open browser after a short delay"""
    time.sleep(2)  # Wait for server to start
    url = f"http://{HOST}:{PORT}"
    print(f"\n🌐 Opening browser at: {url}")
    webbrowser.open(url)


def main():
    """Main application entry point"""
    print("\n" + "="*60)
    print("🍎 CALIBER - Food Classification & Health Chatbot")
    print("="*60)
    print(f"Backend API: FastAPI + TensorFlow")
    print(f"Frontend: React + Vite")
    print("="*60)
    
    # Check if running in production mode (Render)
    is_production = os.getenv("RENDER") == "true" or os.getenv("PORT") is not None
    
    if is_production:
        print("\n🚀 Running in PRODUCTION mode (Render)")
        # In production, assume frontend is pre-built during deployment
        PORT_PROD = int(os.getenv("PORT", 10000))
        setup_static_files()
        
        print(f"\n✅ Starting server on 0.0.0.0:{PORT_PROD}")
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=PORT_PROD,
            log_level="info"
        )
    else:
        print("\n💻 Running in DEVELOPMENT mode")
        
        # Build frontend
        build_success = build_frontend()
        
        if build_success:
            # Setup static file serving
            setup_static_files()
            
            # Open browser in background
            browser_thread = Thread(target=open_browser, daemon=True)
            browser_thread.start()
            
            print(f"\n✅ Starting integrated server...")
            print(f"   🔗 Application: http://{HOST}:{PORT}")
            print(f"   📡 API Docs: http://{HOST}:{PORT}/docs")
            print(f"   🏥 Health Check: http://{HOST}:{PORT}/health")
            print("\n   Press Ctrl+C to stop the server")
            print("="*60 + "\n")
            
            # Start server
            try:
                uvicorn.run(
                    app,
                    host=HOST,
                    port=PORT,
                    log_level="info"
                )
            except KeyboardInterrupt:
                print("\n\n👋 Shutting down gracefully...")
        else:
            print("\n❌ Failed to build frontend. Server not started.")
            print("   Please check the error messages above.")
            sys.exit(1)


if __name__ == "__main__":
    main()
