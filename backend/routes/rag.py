from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db, Policy
from backend.rag_utils import retrieve_policy_chunks, ask_gemini

router = APIRouter(prefix="/api")

class QuestionRequest(BaseModel):
    question: str
    user_id: int = 1

def is_off_topic(question: str) -> bool:
    """Classifies if a question is explicitly out of scope (like sports, celebrities, science)."""
    q_low = question.lower().strip()
    
    # Keywords representing obvious out-of-domain queries
    out_of_domain = [
        "virat", "kohli", "dhoni", "sachin", "cricket", "football", "sports", 
        "movie", "song", "actor", "weather", "recipe", "capital of", "president", 
        "prime minister", "quantum", "physics", "programming", "code", "history"
    ]
    
    if any(o in q_low for o in out_of_domain):
        return True
        
    return False

@router.post("/ask")
async def ask_question(req: QuestionRequest, db: Session = Depends(get_db)):
    """Asks a question about the insurance policy using RAG."""
    # Check for off-topic query guardrails
    if is_off_topic(req.question):
        return {
            "answer": "I'm an AI Insurance Copilot.\n\nI can answer questions related to:\n• Insurance Policy\n• Coverage\n• Claim Process\n• Waiting Period\n• Required Documents\n• Claim Analysis",
            "retrieved_context": []
        }

    # Check if a policy has been uploaded for the user
    policy = db.query(Policy).filter(Policy.user_id == req.user_id).order_by(Policy.uploaded_at.desc()).first()
    if not policy:
        return {
            "answer": "No policy has been uploaded yet. Please upload an insurance policy PDF first before asking questions."
        }
        
    # Retrieve relevant chunks from FAISS index or local backup
    chunks = retrieve_policy_chunks(req.question, k=3)
    context = "\n---\n".join(chunks)
    
    # Construct prompt using requested template
    prompt = f"""You are an AI Insurance Copilot.

Your job is to answer ONLY questions related to the uploaded insurance policy.

You MUST use the retrieved policy context provided below.

Rules:

1. Answer ONLY using the retrieved policy context.
2. Do NOT invent information that is not present in the policy.
3. If the answer is not found in the policy, reply:
   "I couldn't find this information in the uploaded insurance policy."
4. Keep answers concise and conversational.
5. If the user asks about:
   - Coverage → explain whether it is covered and mention conditions.
   - Waiting period → provide the waiting period.
   - Network hospitals → list hospitals mentioned in the policy.
   - Claim documents → list required documents.
   - Claim process → explain the process.
   - Maximum reimbursement → provide the limit.
   - Exclusions → explain what is not covered.
6. Do NOT always explain the claim process unless the user specifically asks.
7. If the user asks an unrelated question (e.g., "Who is Virat Kohli?" or "Write Java code"), reply:
   "I am an AI Insurance Copilot. I can only answer questions related to the uploaded insurance policy."

Retrieved Policy Context:
{context}

User Question:
{req.question}

Answer:
"""
    
    # Generate answer
    answer = ask_gemini(prompt, system_instruction="You are an expert insurance policy analyzer.")
    
    return {
        "answer": answer,
        "retrieved_context": chunks
    }
