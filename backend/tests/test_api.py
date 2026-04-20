"""Backend API tests for Chala Le Gouter Antillais"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealth:
    """Health check tests"""
    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"
        print(f"Health: {data}")

    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200

class TestContact:
    """Contact form tests"""
    def test_submit_contact(self):
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "Test message from automated test"
        }
        r = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "Test User"
        assert data["email"] == "test@example.com"
        assert "id" in data
        print(f"Contact submitted: {data}")

    def test_submit_contact_with_phone(self):
        payload = {
            "name": "TEST_User2",
            "email": "test2@example.com",
            "phone": "514-555-0000",
            "subject": "Catering Inquiry",
            "message": "I need catering for 50 people"
        }
        r = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_User2"
        print(f"Contact with phone: {data}")

    def test_submit_contact_missing_required(self):
        payload = {"name": "No Email"}
        r = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 422

    def test_get_messages(self):
        r = requests.get(f"{BASE_URL}/api/contact")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"Messages count: {len(data)}")
