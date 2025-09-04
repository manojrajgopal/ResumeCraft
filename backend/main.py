from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, resume, user
from contextlib import asynccontextmanager
from utils.database import connect_db, close_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database
    await connect_db()
    yield
    # Shutdown: close database connection
    await close_db()

app = FastAPI(
    title="Resume Platform API",
    description="Backend API for Resume Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/users", tags=["Users"])
app.include_router(resume.router, prefix="/api/resumes", tags=["Resumes"])

@app.get("/")
async def root():
    return {"message": "Resume Platform API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)