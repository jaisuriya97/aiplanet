from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import models
from .. import schemas
from ..db import database
from ..llm.openai import openai_client
from ..vector_store.chroma import chroma_db
from ..tools.serpapi import serpapi_client
from ..llm.gemini import gemini_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/run")
async def run_workflow(workflow: schemas.Workflow, db: Session = Depends(database.get_db)):
    """
    Execute a workflow by processing components in sequence.
    """
    try:
        query = workflow.query
        response = ""
        context = ""
        
        logger.info(f"Starting workflow execution with query: {query}")

        for component in workflow.definition:
            component_type = component.type
            component_config = component.config or {}
            
            logger.info(f"Processing component: {component_type}")
            
            if component_type == "user_query":
                # Query is already available
                pass
                
            elif component_type == "knowledge_base":
                try:
                    # Query the vector store for relevant context
                    n_results = component_config.get("n_results", 3)
                    results = chroma_db.query(query_texts=[query], n_results=n_results)
                    
                    if results and results.get('documents') and len(results['documents']) > 0:
                        context = " ".join(results['documents'][0])
                        logger.info(f"Retrieved {len(results['documents'][0])} context chunks")
                except Exception as e:
                    logger.error(f"Error querying knowledge base: {str(e)}")
                    # Continue without context if knowledge base fails
                    
            elif component_type == "llm_engine":
                # Get LLM provider and model
                llm_provider = component_config.get("llm_provider", "openai")
                model = component_config.get("model", "gpt-3.5-turbo" if llm_provider == "openai" else "gemini-1.5-flash")
                custom_prompt = component_config.get("custom_prompt", "")
                use_serpapi = component_config.get("use_serpapi", False)
                
                # Build the final prompt
                final_prompt = query
                
                # Add context if available
                if context:
                    final_prompt = f"Context: {context}\n\nQuery: {query}"
                
                # Add custom prompt if provided
                if custom_prompt:
                    final_prompt = f"{custom_prompt}\n\n{final_prompt}"
                
                # Add web search results if enabled
                if use_serpapi:
                    try:
                        search_results = serpapi_client.search(query)
                        # Extract organic results
                        if 'organic_results' in search_results:
                            search_snippets = [r.get('snippet', '') for r in search_results['organic_results'][:3]]
                            final_prompt += "\n\nWeb Search Results: " + " ".join(search_snippets)
                        logger.info("Added web search results to prompt")
                    except Exception as e:
                        logger.error(f"Error fetching SerpAPI results: {str(e)}")
                
                # Call the LLM
                try:
                    if llm_provider == "openai":
                        response = openai_client.get_chat_completion(final_prompt, model=model)
                    elif llm_provider == "gemini":
                        response = gemini_client.get_chat_completion(final_prompt, model=model)
                    else:
                        raise HTTPException(status_code=400, detail=f"Invalid LLM provider: {llm_provider}")
                    
                    logger.info("LLM response generated successfully")
                except Exception as e:
                    logger.error(f"Error calling LLM: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")
                    
            elif component_type == "output":
                # The response will be returned to the user
                pass

        # Save to chat logs if workflow has an ID
        if workflow.id:
            chat_log = models.ChatLog(
                workflow_id=workflow.id, 
                query=workflow.query, 
                response=response
            )
            db.add(chat_log)
            db.commit()

        return {"response": response, "success": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in workflow execution: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow execution error: {str(e)}")
