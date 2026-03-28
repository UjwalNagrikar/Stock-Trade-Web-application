import re
from typing import Any

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_PHONE_RE = re.compile(r"^[\+\d\s\-\(\)]{7,20}$")

MAX_LENGTHS = {
    "full_name": 120,
    "email":     254,
    "phone":     25,
    "message":   4000,
}

def validate_contact_payload(data: dict[str, Any]) -> list[str]:
    """Validate the contact form payload. Returns a list of error messages."""
    errors: list[str] = []

    # ── Required fields ───────────────────────────────────────────────────────
    required = ["full_name", "email"]
    for field in required:
        val = data.get(field, "")
        if not isinstance(val, str) or not val.strip():
            errors.append(f"'{field}' is required.")

    if errors:
        return errors

    # ── Length limits ─────────────────────────────────────────────────────────
    for field, limit in MAX_LENGTHS.items():
        val = data.get(field, "") or ""
        if len(val) > limit:
            errors.append(f"'{field}' must not exceed {limit} characters.")

    # ── Email format ──────────────────────────────────────────────────────────
    email = data.get("email", "").strip()
    if email and not _EMAIL_RE.match(email):
        errors.append("Please provide a valid email address.")

    # ── Phone format (optional) ───────────────────────────────────────────────
    phone = data.get("phone", "").strip()
    if phone and not _PHONE_RE.match(phone):
        errors.append("Phone number format is invalid.")

    return errors