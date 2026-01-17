from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .api import api_router
from .db import models, database, get_db
from sqlalchemy.orm import Session
import os

if not os.environ.get("TESTING"):
    models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Workflow Builder API",
    description="API for building and executing intelligent workflows",
    version="1.0.0"
)

# Configure CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api", dependencies=[Depends(get_db)])
