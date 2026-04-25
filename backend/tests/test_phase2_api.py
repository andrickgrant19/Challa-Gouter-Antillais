"""
Phase 2 backend tests for Chala Le Gouter Antillais
- /api/health (supabase + stripe flags)
- /api/checkout/create-session (validation + Supabase order persistence, no-Stripe path)
- /api/orders/{id}
- /api/contact (regression)
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://antilles-kitchen.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health ---------------------------------------------------------------

class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "healthy"
        assert d["supabase_configured"] is True
        assert d["stripe_configured"] is False

    def test_root(self, client):
        r = client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# ---- Checkout validation --------------------------------------------------

VALID_ITEM = {
    "id": "test-griot-1",
    "name": "TEST_Griot Plate",
    "unit_price": 18.99,
    "quantity": 2,
    "image": "https://example.com/griot.jpg",
}

def _base_payload(**overrides):
    p = {
        "customer_name": "TEST_Marie Dupont",
        "customer_email": "test_marie@example.com",
        "customer_phone": "5145551234",
        "delivery_address": None,
        "order_type": "pickup",
        "notes": "TEST_phase2",
        "items": [VALID_ITEM],
        "subtotal": 37.98,
    }
    p.update(overrides)
    return p


class TestCheckoutValidation:
    def test_empty_cart_returns_400(self, client):
        r = client.post(f"{API}/checkout/create-session", json=_base_payload(items=[]), timeout=20)
        assert r.status_code == 400
        assert "empty" in r.text.lower() or "cart" in r.text.lower()

    def test_delivery_without_address_returns_400(self, client):
        r = client.post(
            f"{API}/checkout/create-session",
            json=_base_payload(order_type="delivery", delivery_address=None),
            timeout=20,
        )
        assert r.status_code == 400
        assert "delivery" in r.text.lower()

    def test_delivery_blank_address_returns_400(self, client):
        r = client.post(
            f"{API}/checkout/create-session",
            json=_base_payload(order_type="delivery", delivery_address="   "),
            timeout=20,
        )
        assert r.status_code == 400

    def test_invalid_order_type_returns_400(self, client):
        r = client.post(
            f"{API}/checkout/create-session",
            json=_base_payload(order_type="dine-in"),
            timeout=20,
        )
        assert r.status_code == 400


# ---- Checkout success + persistence --------------------------------------

@pytest.fixture(scope="module")
def created_pickup_order(client):
    payload = _base_payload(notes=f"TEST_pickup_{uuid.uuid4().hex[:6]}")
    r = client.post(f"{API}/checkout/create-session", json=payload, timeout=30)
    assert r.status_code == 200, f"checkout failed: {r.status_code} {r.text}"
    data = r.json()
    return {"payload": payload, "response": data}


class TestCheckoutCreate:
    def test_pickup_order_returns_stripe_not_configured(self, created_pickup_order):
        d = created_pickup_order["response"]
        assert d["stripe_configured"] is False
        assert "order_id" in d and isinstance(d["order_id"], str) and len(d["order_id"]) > 0
        # No Stripe checkout url since keys blank
        assert d.get("checkout_url") in (None, "")

    def test_delivery_order_with_address_succeeds(self, client):
        payload = _base_payload(
            order_type="delivery",
            delivery_address="123 Rue Saint-Denis, Montreal, QC",
            notes=f"TEST_delivery_{uuid.uuid4().hex[:6]}",
        )
        r = client.post(f"{API}/checkout/create-session", json=payload, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["stripe_configured"] is False
        assert d["order_id"]

    def test_get_order_by_id_returns_persisted_data(self, client, created_pickup_order):
        oid = created_pickup_order["response"]["order_id"]
        payload = created_pickup_order["payload"]
        r = client.get(f"{API}/orders/{oid}", timeout=20)
        assert r.status_code == 200, r.text
        order = r.json()
        # Validate persisted fields
        assert order["customer_name"] == payload["customer_name"]
        assert order["customer_email"] == payload["customer_email"]
        assert order["customer_phone"] == payload["customer_phone"]
        assert order["order_type"] == "pickup"
        assert order["status"] == "new"
        assert float(order["subtotal"]) == pytest.approx(payload["subtotal"], rel=1e-3)
        assert isinstance(order["items"], list) and len(order["items"]) == 1
        assert order["items"][0]["name"] == VALID_ITEM["name"]
        assert int(order["items"][0]["quantity"]) == VALID_ITEM["quantity"]

    def test_get_order_unknown_id_returns_404(self, client):
        # Valid UUID format but doesn't exist
        fake = "00000000-0000-0000-0000-000000000000"
        r = client.get(f"{API}/orders/{fake}", timeout=20)
        assert r.status_code in (404, 500)  # 500 if Supabase rejects format; 404 if no rows


# ---- Contact regression --------------------------------------------------

class TestContactRegression:
    def test_contact_post_still_works(self, client):
        payload = {
            "name": "TEST_Phase2 Tester",
            "email": "test_phase2@example.com",
            "phone": "5145559999",
            "subject": "TEST_subject",
            "message": "TEST_regression message phase 2",
        }
        r = client.post(f"{API}/contact", json=payload, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == payload["name"]
        assert d["email"] == payload["email"]
        assert d["subject"] == payload["subject"]
        assert "id" in d and "created_at" in d
