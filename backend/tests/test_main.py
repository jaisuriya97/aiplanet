import os
os.environ["OPENAI_API_KEY"] = "test"
os.environ["GEMINI_API_KEY"] = "test"

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import database, models
from app.llm.openai import openai_client
from app.tools.serpapi import serpapi_client
from app.vector_store.chroma import chroma_db
from unittest.mock import MagicMock, patch

@pytest.fixture
def mock_fitz():
    with patch('fitz.open') as mock_open:
        mock_doc = MagicMock()
        mock_page = MagicMock()
        mock_page.get_text.return_value = "This is a mock PDF."
        mock_doc.__iter__.return_value = [mock_page]
        mock_open.return_value = mock_doc
        yield mock_open

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_db():
    database.engine = MagicMock()
    models.Base.metadata.create_all = MagicMock()
    database.SessionLocal = MagicMock()
    db = MagicMock()
    db.add = MagicMock()
    db.commit = MagicMock()
    db.refresh = MagicMock()
    database.SessionLocal.return_value = db
    return db

@pytest.fixture
def mock_openai():
    mock_chat_completion = MagicMock()
    mock_chat_completion.choices[0].message.content = "This is a mock response."
    
    mock_embedding = MagicMock()
    mock_embedding.data[0].embedding = [0.1, 0.2, 0.3]

    with patch('app.llm.openai.client') as mock_client:
        mock_client.chat.completions.create.return_value = mock_chat_completion
        mock_client.embeddings.create.return_value = mock_embedding
        yield mock_client

@pytest.fixture
def mock_gemini():
    with patch('app.llm.gemini.genai') as mock_genai:
        mock_model = MagicMock()
        mock_model.generate_content.return_value.text = "This is a mock response from Gemini."
        mock_genai.GenerativeModel.return_value = mock_model
        mock_genai.embed_content.return_value = {'embedding': [0.4, 0.5, 0.6]}
        yield mock_genai

@pytest.fixture
def mock_serpapi():
    serpapi_client.search = MagicMock(return_value={"organic_results": []})
    return serpapi_client

@pytest.fixture
def mock_chroma():
    chroma_db.query = MagicMock(return_value={'documents': [['mock document']]})
    return chroma_db

def test_run_workflow_success(client, mock_db, mock_openai, mock_serpapi, mock_chroma):
    workflow = {
        "id": 1,
        "name": "Test Workflow",
        "definition": [
            {"id": "1", "type": "user_query", "config": {}},
            {"id": "2", "type": "llm_engine", "config": {"model": "gpt-3.5-turbo", "use_serpapi": False}},
        ],
        "query": "What is the capital of France?",
    }
    response = client.post("/api/workflow/run", json=workflow)
    assert response.status_code == 200
    assert response.json() == {"response": "This is a mock response."}

def test_run_workflow_invalid_workflow(client, mock_db):
    workflow = {
        "id": 1,
        "name": "Test Workflow",
        "definition": [
            {"id": "1", "type": "invalid_component", "config": {}},
        ],
        "query": "What is the capital of France?",
    }
    response = client.post("/api/workflow/run", json=workflow)
    assert response.status_code == 200
    assert response.json() == {"response": ""}

def test_run_workflow_with_serpapi(client, mock_db, mock_openai, mock_serpapi, mock_chroma):
    workflow = {
        "id": 1,
        "name": "Test Workflow",
        "definition": [
            {"id": "1", "type": "user_query", "config": {}},
            {"id": "2", "type": "llm_engine", "config": {"model": "gpt-3.5-turbo", "use_serpapi": True}},
        ],
        "query": "What is the capital of France?",
    }
    response = client.post("/api/workflow/run", json=workflow)
    assert response.status_code == 200
    assert response.json() == {"response": "This is a mock response."}
    mock_serpapi.search.assert_called_once_with("What is the capital of France?")

def test_run_workflow_with_knowledge_base(client, mock_db, mock_openai, mock_serpapi, mock_chroma):
    workflow = {
        "id": 1,
        "name": "Test Workflow",
        "definition": [
            {"id": "1", "type": "user_query", "config": {}},
            {"id": "2", "type": "knowledge_base", "config": {"n_results": 3}},
            {"id": "3", "type": "llm_engine", "config": {"model": "gpt-3.5-turbo", "use_serpapi": False}},
        ],
        "query": "What is the capital of France?",
    }
    response = client.post("/api/workflow/run", json=workflow)
    assert response.status_code == 200
    assert response.json() == {"response": "This is a mock response."}
    mock_chroma.query.assert_called_once_with(query_texts=["What is the capital of France?"], n_results=3)

def test_upload_documents(client, mock_db, mock_fitz, mock_openai):
    with open("test.pdf", "wb") as f:
        f.write(b"test content")
    
    with open("test.pdf", "rb") as f:
        response = client.post("/api/knowledge_base/upload", files={"files": ("test.pdf", f, "application/pdf")})

    assert response.status_code == 200
    assert response.json() == {"message": "1 documents uploaded and processed."}

def test_run_workflow_with_gemini(client, mock_db, mock_gemini, mock_serpapi, mock_chroma):
    workflow = {
        "id": 1,
        "name": "Test Workflow",
        "definition": [
            {"id": "1", "type": "user_query", "config": {}},
            {"id": "2", "type": "llm_engine", "config": {"llm_provider": "gemini", "model": "gemini-3-flash-preview", "use_serpapi": False}},
        ],
        "query": "What is the capital of France?",
    }
    response = client.post("/api/workflow/run", json=workflow)
    assert response.status_code == 200
    assert response.json() == {"response": "This is a mock response from Gemini."}

def test_upload_documents_with_gemini_embeddings(client, mock_db, mock_fitz, mock_gemini):
    with open("test.pdf", "wb") as f:
        f.write(b"test content")
    
    with open("test.pdf", "rb") as f:
        response = client.post("/api/knowledge_base/upload?embedding_provider=gemini", files={"files": ("test.pdf", f, "application/pdf")})

    assert response.status_code == 200
    assert response.json() == {"message": "1 documents uploaded and processed."}
