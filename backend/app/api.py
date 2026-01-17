from fastapi import APIRouter

from .endpoints import user_query, knowledge_base, llm_engine, output, workflow

api_router = APIRouter()
api_router.include_router(user_query.router, prefix="/user_query", tags=["user_query"])
api_router.include_router(knowledge_base.router, prefix="/knowledge_base", tags=["knowledge_base"])
api_router.include_router(llm_engine.router, prefix="/llm_engine", tags=["llm_engine"])
api_router.include_router(output.router, prefix="/output", tags=["output"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["workflow"])
