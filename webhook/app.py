# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import Optional
# import os
# from dotenv import load_dotenv
# from google.cloud import dialogflow_v2 as dialogflow

# # ✅ Load environment variables
# load_dotenv()

# app = FastAPI()

# # ✅ Allow CORS from your frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # Update if deployed
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ✅ Pydantic schema for incoming message
# class Message(BaseModel):
#     message: str
#     session_id: Optional[str] = "123456"

# @app.post("/webhook")
# async def webhook(message: Message):
#     try:
#         project_id = os.getenv("PROJECT_ID")
#         creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

#         print("🔐 Project ID:", project_id)
#         print("🔐 Credentials Path:", creds_path)

#         if not project_id or not creds_path:
#             raise HTTPException(status_code=500, detail="Missing credentials or project ID.")

#         # ✅ Create Dialogflow session client
#         session_client = dialogflow.SessionsClient()
#         print("✅ SessionsClient created")

#         session = session_client.session_path(project_id, message.session_id)
#         print("📡 Dialogflow session path:", session)

#         # ✅ Trigger Welcome intent or regular message
#         if message.message == "__WELCOME__":
#             print("🟡 Triggering WELCOME event")
#             event_input = dialogflow.EventInput(name="Welcome", language_code="en-US")
#             query_input = dialogflow.QueryInput(event=event_input)
#         else:
#             print("📝 Sending text message:", message.message)
#             text_input = dialogflow.TextInput(text=message.message, language_code="en-US")
#             query_input = dialogflow.QueryInput(text=text_input)

#         # ✅ Send the request to Dialogflow
#         response = session_client.detect_intent(
#             request={"session": session, "query_input": query_input}
#         )

#         fulfillment_text = response.query_result.fulfillment_text
#         print("✅ Fulfillment text:", fulfillment_text)

#         return {"response": fulfillment_text}

#     except Exception as e:
#         print("❌ ERROR:", str(e))
#         raise HTTPException(status_code=500, detail=str(e))

# # ✅ For local dev use
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("app:app", host="127.0.0.1", port=5050, reload=True)


# ---------- backend/main.py ----------
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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str
    session_id: Optional[str] = "123456"
    context: Optional[Dict[str, Any]] = {}

question_flow = [
    {"id": "dob", "question": "What is your date of birth?", "type": "date", "next": "unemployed"},
    {"id": "unemployed", "question": "Have you been unemployed for 27 weeks or more in the past year?", "type": "yesno", "next": {"yes": "unemp-benefits", "no": "tanf"}},
    {"id": "unemp-benefits", "question": "Did you receive unemployment compensation during that time?", "type": "yesno", "eligibility": {"yes": ["Long-Term Unemployed"]}, "next": "tanf"},
    {"id": "tanf", "question": "Have you received TANF (welfare) in the last 18 months?", "type": "yesno", "eligibility": {"yes": ["TANF Recipient"]}, "next": "snap"},
    {"id": "snap", "question": "Have you or your household received SNAP (food stamps) in the last 15 months?", "type": "yesno", "eligibility": {"yes": ["SNAP Recipient"]}, "next": "felon"},
    {"id": "felon", "question": "Have you been convicted of a felony?", "type": "yesno", "next": {"yes": "felon-details", "no": "veteran"}},
    {"id": "felon-details", "question": "Were you released from prison within the last 12 months?", "type": "yesno", "eligibility": {"yes": ["Ex-Felon"]}, "next": "veteran"},
    {"id": "veteran", "question": "Have you served in the U.S. military?", "type": "yesno", "next": {"yes": "veteran-details", "no": "rehab"}},
    {"id": "veteran-details", "question": "Are you a disabled veteran or have been unemployed for 4+ weeks in the past year?", "type": "yesno", "eligibility": {"yes": ["Qualified Veteran"]}, "next": "rehab"},
    {"id": "rehab", "question": "Have you been referred to this job by a rehab program, SSI, or ticket-to-work?", "type": "yesno", "eligibility": {"yes": ["VR/SSI Referral"]}, "next": "zipcode"},
    {"id": "zipcode", "question": "What is your current ZIP code?", "type": "zip", "checkEmpowermentZone": True, "eligibility": {"inZone": ["Empowerment Zone Youth"]}}
]

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

