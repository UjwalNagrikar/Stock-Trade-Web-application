"""
mailer.py — SMTP email notifications for UNiverse Capital.

Sends a plain-text notification to the firm's inbox whenever
a new enquiry is submitted.  Uses Python's stdlib smtplib —
no external mail library needed.

Configure via .env (see .env.example).
If SMTP_HOST is not set, notifications are silently skipped.
"""

import logging
import os
import smtplib
import textwrap
from datetime import datetime
from email.message import EmailMessage
from email.utils import formatdate

log = logging.getLogger("universe.mailer")


# ── Config read from environment ──────────────────────────────────────────────
def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip()


class MailConfig:
    SMTP_HOST    = _env("SMTP_HOST")
    SMTP_PORT    = int(_env("SMTP_PORT", "587"))
    SMTP_USER    = _env("SMTP_USER")
    SMTP_PASS    = _env("SMTP_PASS")
    SMTP_FROM    = _env("SMTP_FROM", "noreply@universecapital.in")
    NOTIFY_TO    = _env("NOTIFY_TO", "contact@universecapital.in")
    USE_TLS      = _env("SMTP_USE_TLS", "true").lower() in ("1", "true", "yes")
    ENABLED      = bool(SMTP_HOST)


def _build_notification(enquiry: dict) -> EmailMessage:
    """Build the admin notification email."""
    msg = EmailMessage()
    msg["Subject"] = (
        f"[UNiverse Capital] New Enquiry — {enquiry.get('investor_type', 'Unknown')} "
        f"#{enquiry.get('id', '?')}"
    )
    msg["From"]    = MailConfig.SMTP_FROM
    msg["To"]      = MailConfig.NOTIFY_TO
    msg["Date"]    = formatdate(localtime=False)

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    body = textwrap.dedent(f"""\
        New enquiry received on {ts}

        ──────────────────────────────
        CONTACT DETAILS
        ──────────────────────────────
        Name              : {enquiry.get('full_name', '—')}
        Email             : {enquiry.get('email', '—')}
        Phone             : {enquiry.get('phone') or '—'}
        Nature of Interest: {enquiry.get('investor_type', '—')}
        Investment Horizon: {enquiry.get('investment_horizon', '—')}

        MESSAGE
        ──────────────────────────────
        {enquiry.get('message') or '(no message)'}

        ──────────────────────────────
        Submitted from    : {enquiry.get('ip_address', '—')}
        Internal ID       : #{enquiry.get('id', '—')}
        ──────────────────────────────

        This is an automated notification. Reply directly to this email
        to contact the enquirer at {enquiry.get('email', '—')}.
    """)
    msg.set_content(body)

    # Set Reply-To to the enquirer's address for one-click reply
    if enquiry.get("email"):
        msg["Reply-To"] = enquiry["email"]

    return msg


def send_enquiry_notification(enquiry: dict) -> bool:
    """
    Send an admin notification for a new enquiry.

    Args:
        enquiry: dict with keys: id, full_name, email, phone,
                 investor_type, investment_horizon, message, ip_address

    Returns:
        True on success, False if skipped or failed.
    """
    if not MailConfig.ENABLED:
        log.debug("SMTP not configured — skipping notification.")
        return False

    msg = _build_notification(enquiry)

    try:
        with smtplib.SMTP(MailConfig.SMTP_HOST, MailConfig.SMTP_PORT, timeout=10) as smtp:
            smtp.ehlo()
            if MailConfig.USE_TLS:
                smtp.starttls()
                smtp.ehlo()
            if MailConfig.SMTP_USER and MailConfig.SMTP_PASS:
                smtp.login(MailConfig.SMTP_USER, MailConfig.SMTP_PASS)
            smtp.send_message(msg)
        log.info("Notification sent for enquiry #%s to %s", enquiry.get("id"), MailConfig.NOTIFY_TO)
        return True
    except smtplib.SMTPException as exc:
        log.error("SMTP error sending notification: %s", exc)
        return False
    except OSError as exc:
        log.error("Network error sending notification: %s", exc)
        return False


def send_confirmation_to_enquirer(enquiry: dict) -> bool:
    """
    Send an auto-reply confirmation to the person who submitted the form.

    Returns:
        True on success, False if skipped or failed.
    """
    if not MailConfig.ENABLED or not enquiry.get("email"):
        return False

    msg = EmailMessage()
    msg["Subject"] = "UNiverse Capital — We have received your enquiry"
    msg["From"]    = MailConfig.SMTP_FROM
    msg["To"]      = enquiry["email"]
    msg["Date"]    = formatdate(localtime=False)

    name = enquiry.get("full_name", "").split()[0] or "there"
    body = textwrap.dedent(f"""\
        Dear {name},

        Thank you for reaching out to UNiverse Capital.

        We have received your enquiry and will respond within five business days.
        For urgent matters, you may contact us directly at contact@universecapital.in.

        Your reference number is: #{enquiry.get('id', '—')}

        Regards,
        UNiverse Capital
        Nagpur, India
        ──────────────────────────────────────────────────────
        This is an automated message. Please do not reply to this email.
        Contact us at contact@universecapital.in for assistance.
    """)
    msg.set_content(body)

    try:
        with smtplib.SMTP(MailConfig.SMTP_HOST, MailConfig.SMTP_PORT, timeout=10) as smtp:
            smtp.ehlo()
            if MailConfig.USE_TLS:
                smtp.starttls()
                smtp.ehlo()
            if MailConfig.SMTP_USER and MailConfig.SMTP_PASS:
                smtp.login(MailConfig.SMTP_USER, MailConfig.SMTP_PASS)
            smtp.send_message(msg)
        log.info("Confirmation sent to %s", enquiry["email"])
        return True
    except (smtplib.SMTPException, OSError) as exc:
        log.error("Failed to send confirmation to %s: %s", enquiry["email"], exc)
        return False