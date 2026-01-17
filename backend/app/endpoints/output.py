from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def output(response: str):
    return {"message": "Output received", "response": response}
