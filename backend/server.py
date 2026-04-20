from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Chala Le Gouter Antillais API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Models ────────────────────────────────────────────────────────────────────

class ContactMessage(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str

class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    subject: str
    created_at: str

# ─── Routes ────────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Chala Le Gouter Antillais API", "status": "ok"}

@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(data: ContactMessage):
    try:
        doc = {
            "name": data.name,
            "email": data.email,
            "phone": data.phone or "",
            "subject": data.subject,
            "message": data.message,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.contact_messages.insert_one(doc)
        logger.info(f"Contact from {data.name} ({data.email}): {data.subject}")
        return ContactResponse(
            id=str(result.inserted_id),
            name=data.name,
            email=data.email,
            subject=data.subject,
            created_at=doc["created_at"],
        )
    except Exception as e:
        logger.error(f"Contact form error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save message")

@api_router.get("/contact", response_model=List[ContactResponse])
async def get_messages():
    messages = await db.contact_messages.find({}, {"_id": 0}).to_list(100)
    result = []
    for m in messages:
        try:
            result.append(ContactResponse(
                id=str(m.get("_id", "")),
                name=m.get("name", ""),
                email=m.get("email", ""),
                subject=m.get("subject", ""),
                created_at=m.get("created_at", ""),
            ))
        except Exception:
            continue
    return result

@api_router.get("/health")
async def health():
    return {"status": "healthy", "restaurant": "Chala Le Gouter Antillais"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
