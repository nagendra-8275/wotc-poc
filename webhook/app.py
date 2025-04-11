from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import os
from google.cloud import dialogflow_v2 as dialogflow

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DIALOGFLOW_PROJECT_ID = os.getenv("DIALOGFLOW_PROJECT_ID")
DIALOGFLOW_LANGUAGE_CODE = "en"

class Message(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"
    context: Optional[Dict[str, Any]] = {}
    event: Optional[bool] = False

@app.post("/webhook")
async def webhook(message: Message):
    try:
        print("📩 Incoming message:", message)

        session_client = dialogflow.SessionsClient()
        session = session_client.session_path(DIALOGFLOW_PROJECT_ID, message.session_id)

        if message.event:
            query_input = dialogflow.QueryInput(
                event=dialogflow.EventInput(name="WELCOME", language_code=DIALOGFLOW_LANGUAGE_CODE)
            )
        else:
            query_input = dialogflow.QueryInput(
                text=dialogflow.TextInput(text=message.message, language_code=DIALOGFLOW_LANGUAGE_CODE)
            )

        response = session_client.detect_intent(
            request={"session": session, "query_input": query_input}
        )

        result = response.query_result

        # ✅ Extract parameters (no _pb, no MessageToDict)
        parameters = {k: result.parameters.get(k) for k in result.parameters}

        # ✅ Extract output contexts (as names only)
        output_contexts = [ctx.name for ctx in result.output_contexts]

        # ✅ Extract payload manually
        # ✅ Extract payload manually — SAFE
        next_question_payload = None
        for msg in result.fulfillment_messages:
            if msg.payload and "nextQuestion" in msg.payload:
                q = msg.payload["nextQuestion"]
                next_question_payload = {
                    "id": q.get("id", ""),
                    "text": q.get("text", ""),
                    "type": q.get("type", "text"),
                }

        return {
            "response": result.fulfillment_text,
            "intent": result.intent.display_name,
            "confidence": result.intent_detection_confidence,
            "parameters": parameters,
            "output_contexts": output_contexts,
            "nextQuestion": next_question_payload
        }

    except Exception as e:
        print("❌ Dialogflow Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))