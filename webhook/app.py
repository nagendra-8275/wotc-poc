# ---------- backend/main.py ----------
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import os
from google.cloud import dialogflow_v2 as dialogflow
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str
    session_id: Optional[str] = "123456"
    context: Optional[Dict[str, Any]] = {}


with open('wotc_question_flow.json', 'r') as f:
    question_flow = json.load(f)

def get_step(step_id):
    return next((step for step in question_flow if step["id"] == step_id), None)

@app.post("/webhook")
async def webhook(message: Message):
    try:
        user_input = message.message.strip().lower()
        session_id = message.session_id
        context = message.context or {}

        if user_input == "__welcome__":
            return {
                "response": "👋 Hello! Would you like to check your eligibility for WOTC? (yes or no)",
                "context": {
                    "currentStepId": "start",
                    "answers": {},
                    "eligibility": []
                }
            }

        current_step_id = context.get("currentStepId", "start")
        answers = context.get("answers", {})
        eligibility = context.get("eligibility", [])

        if current_step_id == "start":
            if user_input in ["no", "nah"]:
                return {"response": "👍 No problem. Come back anytime!"}
            elif user_input in ["yes", "yep"]:
                step = get_step("dob")
                return {
                    "response": step["question"],
                    "context": {"currentStepId": step["id"], "answers": answers, "eligibility": eligibility}
                }
            else:
                return {"response": "Please reply with 'yes' or 'no' to begin."}

        current_step = get_step(current_step_id)
        answers[current_step_id] = user_input

        if current_step.get("eligibility"):
            tags = current_step["eligibility"].get(user_input)
            if tags:
                eligibility.extend(tags)

        next_step_id = None
        if isinstance(current_step.get("next"), dict):
            next_step_id = current_step["next"].get(user_input)
        elif isinstance(current_step.get("next"), str):
            next_step_id = current_step["next"]

        if not next_step_id:
            return {
                "response": f"✅ Screening complete. You may be eligible under: {', '.join(eligibility) or 'No categories'}.",
                "context": {"answers": answers, "eligibility": eligibility}
            }

        next_step = get_step(next_step_id)
        return {
            "response": next_step["question"],
            "context": {
                "currentStepId": next_step_id,
                "answers": answers,
                "eligibility": eligibility
            }
        }

    except Exception as e:
        print("❌ ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

