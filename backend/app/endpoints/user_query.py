from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def user_query(query: str):
    return {"message": "User query received", "query": query}
