from fastapi import FastAPI, APIRouter, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import httpx
import stripe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

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

class CartItem(BaseModel):
    id: Any
    name: str
    unit_price: float
    quantity: int
    image: Optional[str] = None

class CheckoutRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: Optional[str] = None
    order_type: str  # "pickup" | "delivery"
    notes: Optional[str] = None
    items: List[CartItem]
    subtotal: float

class CheckoutResponse(BaseModel):
    order_id: str
    checkout_url: Optional[str] = None
    session_id: Optional[str] = None
    stripe_configured: bool

# ─── Supabase REST helpers ────────────────────────────────────────────────────

def _sb_headers(prefer: Optional[str] = None) -> Dict[str, str]:
    h = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        h["Prefer"] = prefer
    return h

async def sb_insert(table: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(500, "Supabase not configured on backend")
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    async with httpx.AsyncClient(timeout=20) as ac:
        r = await ac.post(url, headers=_sb_headers("return=representation"), json=payload)
    if r.status_code >= 400:
        logger.error(f"sb_insert {table} {r.status_code}: {r.text}")
        raise HTTPException(500, f"Supabase insert failed: {r.text}")
    rows = r.json()
    return rows[0] if isinstance(rows, list) and rows else rows

async def sb_update(table: str, match: Dict[str, str], payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(500, "Supabase not configured on backend")
    qs = "&".join([f"{k}=eq.{v}" for k, v in match.items()])
    url = f"{SUPABASE_URL}/rest/v1/{table}?{qs}"
    async with httpx.AsyncClient(timeout=20) as ac:
        r = await ac.patch(url, headers=_sb_headers("return=representation"), json=payload)
    if r.status_code >= 400:
        logger.error(f"sb_update {table} {r.status_code}: {r.text}")
        raise HTTPException(500, f"Supabase update failed: {r.text}")
    return r.json()

async def sb_get(table: str, match: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(500, "Supabase not configured on backend")
    qs = ""
    if match:
        qs = "?" + "&".join([f"{k}=eq.{v}" for k, v in match.items()])
    url = f"{SUPABASE_URL}/rest/v1/{table}{qs}"
    async with httpx.AsyncClient(timeout=20) as ac:
        r = await ac.get(url, headers=_sb_headers())
    if r.status_code >= 400:
        raise HTTPException(500, f"Supabase get failed: {r.text}")
    return r.json()

# ─── Existing routes ──────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Chala Le Gouter Antillais API", "status": "ok"}

@api_router.get("/health")
async def health():
    return {
        "status": "healthy",
        "restaurant": "Chala Le Gouter Antillais",
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY),
        "stripe_configured": bool(STRIPE_SECRET_KEY),
    }

@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(data: ContactMessage):
    payload = {
        "name": data.name,
        "email": data.email,
        "phone": data.phone or None,
        "subject": data.subject,
        "message": data.message,
    }
    row = await sb_insert("contact_messages", payload)
    logger.info(f"Contact from {data.name} ({data.email}): {data.subject}")
    return ContactResponse(
        id=str(row["id"]),
        name=row["name"],
        email=row["email"],
        subject=row["subject"],
        created_at=row["created_at"],
    )

@api_router.get("/contact", response_model=List[ContactResponse])
async def get_messages():
    rows = await sb_get("contact_messages")
    rows.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    out: List[ContactResponse] = []
    for r in rows[:200]:
        try:
            out.append(ContactResponse(
                id=str(r.get("id", "")),
                name=r.get("name", ""),
                email=r.get("email", ""),
                subject=r.get("subject", ""),
                created_at=r.get("created_at", ""),
            ))
        except Exception:
            continue
    return out

# ─── Checkout / Stripe ────────────────────────────────────────────────────────

@api_router.post("/checkout/create-session", response_model=CheckoutResponse)
async def create_checkout_session(data: CheckoutRequest):
    """
    1. Saves order to Supabase with status='new'
    2. If Stripe keys configured → creates a Stripe Checkout Session and returns its URL
    3. Otherwise returns the order_id only (frontend shows "Stripe not configured")
    """
    if data.order_type not in ("pickup", "delivery"):
        raise HTTPException(400, "order_type must be 'pickup' or 'delivery'")
    if data.order_type == "delivery" and not (data.delivery_address and data.delivery_address.strip()):
        raise HTTPException(400, "delivery_address required for delivery orders")
    if not data.items:
        raise HTTPException(400, "Cart is empty")

    # 1. Persist order
    order_payload = {
        "customer_name": data.customer_name.strip(),
        "customer_email": data.customer_email.strip(),
        "customer_phone": data.customer_phone.strip(),
        "delivery_address": (data.delivery_address or "").strip() or None,
        "order_type": data.order_type,
        "notes": (data.notes or "").strip() or None,
        "items": [i.model_dump() for i in data.items],
        "subtotal": round(float(data.subtotal), 2),
        "status": "new",
    }
    order = await sb_insert("orders", order_payload)
    order_id = order["id"]
    logger.info(f"Order created {order_id} subtotal={order_payload['subtotal']}")

    # 2. Optionally create Stripe session
    if not STRIPE_SECRET_KEY:
        return CheckoutResponse(order_id=order_id, stripe_configured=False)

    try:
        line_items = [
            {
                "price_data": {
                    "currency": "cad",
                    "product_data": {"name": i.name},
                    "unit_amount": int(round(float(i.unit_price) * 100)),
                },
                "quantity": int(i.quantity),
            }
            for i in data.items
        ]
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=line_items,
            success_url=f"{FRONTEND_URL}/order-confirmation?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/checkout?cancelled=1",
            customer_email=data.customer_email.strip(),
            metadata={"order_id": order_id, "order_type": data.order_type},
        )
        try:
            await sb_update("orders", {"id": order_id}, {"stripe_session_id": session.id})
        except HTTPException as upd_err:
            logger.warning(f"Could not save stripe_session_id (column may not exist yet): {upd_err.detail}")
        return CheckoutResponse(
            order_id=order_id,
            checkout_url=session.url,
            session_id=session.id,
            stripe_configured=True,
        )
    except Exception as e:
        logger.error(f"Stripe session error: {e}")
        # Order is already saved; surface error so user can retry
        raise HTTPException(500, f"Stripe error: {e}")

@api_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "Stripe not configured")
    payload = await request.body()
    try:
        if STRIPE_WEBHOOK_SECRET and stripe_signature:
            event = stripe.Webhook.construct_event(payload, stripe_signature, STRIPE_WEBHOOK_SECRET)
        else:
            # Dev mode: trust raw payload (warn loudly)
            import json
            event = json.loads(payload.decode("utf-8"))
            logger.warning("Stripe webhook secret not set — accepting unsigned event (dev only)")
    except Exception as e:
        logger.error(f"Webhook verify failed: {e}")
        raise HTTPException(400, "Invalid signature")

    etype = event.get("type") if isinstance(event, dict) else event["type"]
    obj = (event.get("data") or {}).get("object") if isinstance(event, dict) else event["data"]["object"]

    if etype == "checkout.session.completed" and obj:
        order_id = (obj.get("metadata") or {}).get("order_id")
        payment_intent = obj.get("payment_intent")
        if order_id:
            await sb_update("orders", {"id": order_id}, {
                "status": "in_progress",
                "stripe_payment_intent_id": payment_intent,
            })
            logger.info(f"Order {order_id} marked in_progress (payment_intent={payment_intent})")
    return JSONResponse({"received": True})

@api_router.get("/orders/by-session/{session_id}")
async def get_order_by_session(session_id: str):
    rows = await sb_get("orders", {"stripe_session_id": session_id})
    if not rows:
        raise HTTPException(404, "Order not found")
    return rows[0]

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    rows = await sb_get("orders", {"id": order_id})
    if not rows:
        raise HTTPException(404, "Order not found")
    return rows[0]

# ─── App wiring ───────────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
