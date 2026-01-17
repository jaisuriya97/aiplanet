from fastapi import APIRouter
from ..llm.openai import openai_client
from ..llm.gemini import gemini_client

router = APIRouter()

@router.post("/")
async def llm_engine(query: str, context: str = None, prompt: str = None, llm_provider: str = "openai"):
    final_prompt = query
    if context:
        final_prompt = f"Context: {context}\n\nQuery: {query}"
    if prompt:
        final_prompt = f"Instruction: {prompt}\n\n{final_prompt}"

    if llm_provider == "openai":
        return {"message": "LLM engine received request", "response": openai_client.get_chat_completion(final_prompt)}
    elif llm_provider == "gemini":
        return {"message": "LLM engine received request", "response": gemini_client.get_chat_completion(final_prompt)}
    else:
        return {"message": "Invalid LLM provider"}
