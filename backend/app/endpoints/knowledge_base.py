from fastapi import APIRouter, APIRouter, File, UploadFile, Form
from typing import List
from ..llm.openai import OpenAI
from ..llm.gemini import Gemini
from ..vector_store.chroma import ChromaDB
from ..db.models import Document
from ..db.database import SessionLocal
import pymupdf
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
chroma = ChromaDB()

@router.post("/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    embedding_provider: str = Form(default="gemini")
):
    """Upload PDF documents and store embeddings"""
    try:
        results = []
        db = SessionLocal()
        
        for file in files:
            # Extract text from PDF
            content = await file.read()
            pdf_document = pymupdf.open(stream=content, filetype="pdf")
            text = ""
            for page in pdf_document:
                text += page.get_text()
            
            # Generate embeddings based on provider
            try:
                if embedding_provider.lower() == "openai":
                    api_key = os.getenv("OPENAI_API_KEY")
                    if not api_key or api_key == "your_openai_api_key":
                        db.close()
                        return {
                            "error": "OpenAI API key not configured. Please add a valid key to backend/.env",
                            "status": "failed"
                        }
                    openai_client = OpenAI()
                    embedding = openai_client.get_embedding(text)
                else:  # Default to Gemini
                    api_key = os.getenv("GEMINI_API_KEY")
                    if not api_key or api_key.startswith("your_"):
                        db.close()
                        return {
                            "error": "Gemini API key not configured. Please add a valid key to backend/.env",
                            "status": "failed"
                        }
                    gemini_client = Gemini()
                    embedding = gemini_client.get_embedding(text)
                
                # Store in vector database
                chroma.add_document(
                    text=text,
                    embedding=embedding,
                    metadata={"filename": file.filename}
                )
                
                # Store metadata in PostgreSQL
                doc = Document(filename=file.filename, content_preview=text[:500])
                db.add(doc)
                db.commit()
                
                results.append({
                    "filename": file.filename,
                    "status": "success",
                    "text_length": len(text)
                })
                
            except Exception as e:
                logger.error(f"Error processing {file.filename}: {str(e)}")
                db.close()
                return {
                    "error": f"Error generating embeddings: {str(e)}",
                    "status": "failed",
                    "filename": file.filename
                }
        
        db.close()
        return {"documents": results, "status": "success"}
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        return {"error": str(e), "status": "failed"}
