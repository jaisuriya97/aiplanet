from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class Document(BaseModel):
    id: int
    name: str
    meta_data: Dict

    class Config:
        from_attributes = True

class WorkflowComponent(BaseModel):
    id: str
    type: str
    config: Dict = Field(default_factory=dict)

class Workflow(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = "Untitled Workflow"
    definition: List[WorkflowComponent]
    query: str

    class Config:
        from_attributes = True

class ChatLog(BaseModel):
    id: int
    workflow_id: int
    query: str
    response: str

    class Config:
        orm_mode = True
