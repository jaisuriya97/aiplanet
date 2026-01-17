#!/bin/bash

# Project Validation Script
# Tests project structure and configuration without running Docker

set -e

echo "========================================="
echo "🔍 Workflow Builder - Project Validation"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        ((passed++))
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((failed++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Found directory: $1"
        ((passed++))
    else
        echo -e "${RED}✗${NC} Missing directory: $1"
        ((failed++))
    fi
}

# Check project structure
echo "📁 Checking Project Structure..."
echo ""

check_file "README.md"
check_file "docker-compose.yml"
check_file "setup.sh"
check_file "architecture.md"

echo ""
echo "📁 Checking Backend..."
check_dir "backend"
check_file "backend/Dockerfile"
check_file "backend/requirements.txt"
check_file "backend/.env"
check_file "backend/.env.example"
check_dir "backend/app"
check_file "backend/app/main.py"
check_file "backend/app/api.py"
check_file "backend/app/schemas.py"

echo ""
echo "📁 Checking Backend Modules..."
check_dir "backend/app/endpoints"
check_file "backend/app/endpoints/workflow.py"
check_file "backend/app/endpoints/knowledge_base.py"
check_file "backend/app/endpoints/llm_engine.py"
check_file "backend/app/endpoints/user_query.py"
check_file "backend/app/endpoints/output.py"

check_dir "backend/app/llm"
check_file "backend/app/llm/openai.py"
check_file "backend/app/llm/gemini.py"

check_dir "backend/app/tools"
check_file "backend/app/tools/serpapi.py"

check_dir "backend/app/vector_store"
check_file "backend/app/vector_store/chroma.py"

check_dir "backend/app/db"
check_file "backend/app/db/models.py"
check_file "backend/app/db/database.py"

echo ""
echo "📁 Checking Frontend..."
check_dir "frontend"
check_file "frontend/Dockerfile"
check_file "frontend/package.json"
check_dir "frontend/src"
check_file "frontend/src/App.js"
check_file "frontend/src/index.js"

echo ""
echo "📁 Checking Frontend Components..."
check_dir "frontend/src/components"
check_file "frontend/src/components/WorkflowBuilder.js"
check_file "frontend/src/components/Chat.js"
check_file "frontend/src/components/Sidebar.js"
check_file "frontend/src/components/ConfigPanel.js"

check_dir "frontend/src/components/nodes"
check_file "frontend/src/components/nodes/UserQueryNode.js"
check_file "frontend/src/components/nodes/KnowledgeBaseNode.js"
check_file "frontend/src/components/nodes/LLMEngineNode.js"
check_file "frontend/src/components/nodes/OutputNode.js"

echo ""
echo "📁 Checking Kubernetes Files (Optional)..."
check_dir "k8s"
check_file "k8s/01-config.yaml"
check_file "k8s/02-volumes.yaml"
check_file "k8s/03-postgres.yaml"
check_file "k8s/04-backend.yaml"
check_file "k8s/05-frontend.yaml"
check_file "k8s/README.md"

echo ""
echo "🔑 Checking Environment Configuration..."
if [ -f "backend/.env" ]; then
    if grep -q "OPENAI_API_KEY=" backend/.env; then
        echo -e "${GREEN}✓${NC} OPENAI_API_KEY configured"
        ((passed++))
    else
        echo -e "${YELLOW}⚠${NC}  OPENAI_API_KEY not found in .env"
    fi
    
    if grep -q "GEMINI_API_KEY=" backend/.env; then
        echo -e "${GREEN}✓${NC} GEMINI_API_KEY configured"
        ((passed++))
    else
        echo -e "${YELLOW}⚠${NC}  GEMINI_API_KEY not found in .env"
    fi
    
    if grep -q "SERPAPI_API_KEY=" backend/.env; then
        echo -e "${GREEN}✓${NC} SERPAPI_API_KEY configured"
        ((passed++))
    else
        echo -e "${YELLOW}⚠${NC}  SERPAPI_API_KEY not found in .env"
    fi
fi

echo ""
echo "🐍 Checking Python Dependencies..."
if [ -f "backend/requirements.txt" ]; then
    deps=("fastapi" "uvicorn" "sqlalchemy" "psycopg2-binary" "openai" "chromadb" "pymupdf" "google-generativeai" "google-search-results")
    for dep in "${deps[@]}"; do
        if grep -q "$dep" backend/requirements.txt; then
            echo -e "${GREEN}✓${NC} $dep in requirements"
            ((passed++))
        else
            echo -e "${RED}✗${NC} $dep missing from requirements"
            ((failed++))
        fi
    done
fi

echo ""
echo "📦 Checking Node Dependencies..."
if [ -f "frontend/package.json" ]; then
    deps=("react" "react-dom" "reactflow" "axios" "lucide-react" "react-router-dom")
    for dep in "${deps[@]}"; do
        if grep -q "\"$dep\"" frontend/package.json; then
            echo -e "${GREEN}✓${NC} $dep in package.json"
            ((passed++))
        else
            echo -e "${RED}✗${NC} $dep missing from package.json"
            ((failed++))
        fi
    done
fi

echo ""
echo "🔍 Checking Docker Configuration..."
if grep -q "chroma_data:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} ChromaDB volume configured"
    ((passed++))
else
    echo -e "${RED}✗${NC} ChromaDB volume not configured"
    ((failed++))
fi

if grep -q "CHROMA_PERSIST_DIRECTORY" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} ChromaDB persistence environment variable set"
    ((passed++))
else
    echo -e "${YELLOW}⚠${NC}  ChromaDB persistence may not be configured"
fi

if grep -q "CORSMiddleware" backend/app/main.py; then
    echo -e "${GREEN}✓${NC} CORS middleware configured"
    ((passed++))
else
    echo -e "${RED}✗${NC} CORS middleware not found"
    ((failed++))
fi

echo ""
echo "========================================="
echo "📊 Validation Results"
echo "========================================="
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Project is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start Docker Desktop"
    echo "2. Run: ./setup.sh"
    echo "3. Access http://localhost:3000"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  Some checks failed. Review the output above.${NC}"
    echo ""
    exit 1
fi
