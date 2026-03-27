"""
UNiverse Capital — Flask API Backend
--------------------------------------
Routes
  GET  /api/health                  — Health check
  POST /api/contact                 — Submit contact/enquiry form
  GET  /api/enquiries               — Admin: paginated list
  GET  /api/enquiries/<id>          — Admin: single enquiry
  PATCH /api/enquiries/<id>/status  — Admin: update status + notes
  DELETE /api/enquiries/<id>        — Admin: soft-delete (archive)
  POST /api/admin/purge-rate-limit  — Admin: purge stale rate-limit rows
"""

import logging
import os
import threading
from datetime import datetime

from flask import Flask, request, jsonify, g
from flask_cors import CORS

from config import get_config
from db import get_db, close_db, init_db
from validators import validate_contact_payload
from rate_limit import check_rate_limit, RateLimitExceeded
from mailer import send_enquiry_notification, send_confirmation_to_enquirer

log = logging.getLogger("universe")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)


# ── Application factory ───────────────────────────────────────────────────────

def create_app(config_name: str | None = None) -> Flask:
    app = Flask(__name__)

    cfg = get_config(config_name or os.getenv("FLASK_ENV", "development"))
    app.config.from_object(cfg)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=False,
    )

    app.teardown_appcontext(close_db)

    with app.app_context():
        init_db(app)

    _register_routes(app)
    return app


# ── Auth helper ───────────────────────────────────────────────────────────────

def _require_admin(app):
    """Return (True, None) if the request carries a valid admin token."""
    token = (
        request.args.get("token")
        or request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    )
    if not token or token != app.config.get("ADMIN_TOKEN"):
        return False
    return True


# ── Route registration ────────────────────────────────────────────────────────

def _register_routes(app: Flask) -> None:

    # ── Health ────────────────────────────────────────────────────────────────
    @app.get("/api/health")
    def health():
        db_ok = False
        try:
            cur = get_db().cursor()
            cur.execute("SELECT 1")
            cur.fetchone()
            cur.close()
            db_ok = True
        except Exception:
            pass
        status = "ok" if db_ok else "degraded"
        code   = 200 if db_ok else 503
        return jsonify({
            "status":    status,
            "db":        "connected" if db_ok else "unreachable",
            "timestamp": datetime.utcnow().isoformat(),
        }), code

    # ── Contact form ──────────────────────────────────────────────────────────
    @app.post("/api/contact")
    def contact():
        # Rate limit: 5 submissions per IP per hour
        ip = request.remote_addr or "unknown"
        try:
            check_rate_limit(ip, "/api/contact", limit=5)
        except RateLimitExceeded as exc:
            return jsonify({"success": False, "message": str(exc)}), 429

        payload = request.get_json(silent=True) or {}
        errors  = validate_contact_payload(payload)
        if errors:
            return jsonify({"success": False, "message": errors[0]}), 422

        db  = get_db()
        cur = db.cursor()
        try:
            cur.execute(
                """
                INSERT INTO enquiries
                    (full_name, email, phone, investor_type,
                     investment_horizon, message, ip_address, user_agent)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    payload["full_name"].strip(),
                    payload["email"].strip().lower(),
                    payload.get("phone", "").strip() or None,
                    payload["investor_type"],
                    payload["investment_horizon"],
                    payload.get("message", "").strip() or None,
                    ip,
                    (request.user_agent.string[:512]
                     if request.user_agent else None),
                ),
            )
            db.commit()
            enquiry_id = cur.lastrowid
            log.info("New enquiry #%d from %s", enquiry_id, payload["email"])
        except Exception as exc:
            db.rollback()
            log.error("DB insert failed: %s", exc)
            return jsonify({"success": False,
                            "message": "Internal error. Please try again."}), 500
        finally:
            cur.close()

        # ── Send emails asynchronously so the response is instant ─────────────
        enquiry_data = {
            "id":                 enquiry_id,
            "full_name":          payload["full_name"].strip(),
            "email":              payload["email"].strip().lower(),
            "phone":              payload.get("phone", "").strip() or None,
            "investor_type":      payload["investor_type"],
            "investment_horizon": payload["investment_horizon"],
            "message":            payload.get("message", "").strip() or None,
            "ip_address":         ip,
        }

        def _send_emails():
            send_enquiry_notification(enquiry_data)
            send_confirmation_to_enquirer(enquiry_data)

        threading.Thread(target=_send_emails, daemon=True).start()

        return jsonify({
            "success": True,
            "message": "Enquiry received. We will be in touch within five business days.",
            "id":      enquiry_id,
        }), 201

    # ── Admin: list enquiries ─────────────────────────────────────────────────
    @app.get("/api/enquiries")
    def list_enquiries():
        if not _require_admin(app):
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        page        = max(1, int(request.args.get("page", 1)))
        per_page    = min(100, max(1, int(request.args.get("per_page", 20))))
        offset      = (page - 1) * per_page
        status_filter = request.args.get("status")   # optional filter
        search        = request.args.get("q", "").strip()

        db  = get_db()
        cur = db.cursor(dictionary=True)
        try:
            # Build WHERE clause dynamically
            where_parts = []
            params      = []

            if status_filter:
                where_parts.append("status = %s")
                params.append(status_filter)

            if search:
                where_parts.append(
                    "(full_name LIKE %s OR email LIKE %s OR phone LIKE %s)"
                )
                like = f"%{search}%"
                params.extend([like, like, like])

            where_sql = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""

            cur.execute(f"SELECT COUNT(*) AS total FROM enquiries {where_sql}", params)
            total = cur.fetchone()["total"]

            cur.execute(
                f"""
                SELECT id, full_name, email, phone, investor_type,
                       investment_horizon, message, status, submitted_at, updated_at
                FROM   enquiries
                {where_sql}
                ORDER  BY submitted_at DESC
                LIMIT  %s OFFSET %s
                """,
                params + [per_page, offset],
            )
            rows = cur.fetchall()
            for row in rows:
                for dt_key in ("submitted_at", "updated_at"):
                    if isinstance(row.get(dt_key), datetime):
                        row[dt_key] = row[dt_key].isoformat()
        finally:
            cur.close()

        return jsonify({
            "success":  True,
            "total":    total,
            "page":     page,
            "per_page": per_page,
            "pages":    (total + per_page - 1) // per_page,
            "data":     rows,
        })

    # ── Admin: single enquiry ─────────────────────────────────────────────────
    @app.get("/api/enquiries/<int:enquiry_id>")
    def get_enquiry(enquiry_id):
        if not _require_admin(app):
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        db  = get_db()
        cur = db.cursor(dictionary=True)
        try:
            cur.execute(
                """
                SELECT id, full_name, email, phone, investor_type,
                       investment_horizon, message, status, notes,
                       ip_address, user_agent, submitted_at, updated_at
                FROM   enquiries
                WHERE  id = %s AND status != 'archived'
                """,
                (enquiry_id,),
            )
            row = cur.fetchone()
        finally:
            cur.close()

        if not row:
            return jsonify({"success": False, "message": "Not found"}), 404

        for dt_key in ("submitted_at", "updated_at"):
            if isinstance(row.get(dt_key), datetime):
                row[dt_key] = row[dt_key].isoformat()

        return jsonify({"success": True, "data": row})

    # ── Admin: update status / notes ──────────────────────────────────────────
    @app.patch("/api/enquiries/<int:enquiry_id>/status")
    def update_enquiry_status(enquiry_id):
        if not _require_admin(app):
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        payload = request.get_json(silent=True) or {}
        new_status = payload.get("status")
        valid_statuses = {"new", "read", "replied", "archived"}

        if not new_status or new_status not in valid_statuses:
            return jsonify({
                "success": False,
                "message": f"status must be one of: {', '.join(sorted(valid_statuses))}",
            }), 422

        notes = payload.get("notes")
        db    = get_db()
        cur   = db.cursor()
        try:
            if notes is not None:
                cur.execute(
                    "UPDATE enquiries SET status=%s, notes=%s WHERE id=%s",
                    (new_status, str(notes)[:2000], enquiry_id),
                )
            else:
                cur.execute(
                    "UPDATE enquiries SET status=%s WHERE id=%s",
                    (new_status, enquiry_id),
                )
            db.commit()
            affected = cur.rowcount
        except Exception as exc:
            db.rollback()
            log.error("Status update failed: %s", exc)
            return jsonify({"success": False, "message": "DB error"}), 500
        finally:
            cur.close()

        if affected == 0:
            return jsonify({"success": False, "message": "Enquiry not found"}), 404

        return jsonify({"success": True, "message": "Status updated."})

    # ── Admin: archive (soft-delete) ──────────────────────────────────────────
    @app.delete("/api/enquiries/<int:enquiry_id>")
    def archive_enquiry(enquiry_id):
        if not _require_admin(app):
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        db  = get_db()
        cur = db.cursor()
        try:
            cur.execute(
                "UPDATE enquiries SET status='archived' WHERE id=%s",
                (enquiry_id,),
            )
            db.commit()
            affected = cur.rowcount
        except Exception as exc:
            db.rollback()
            log.error("Archive failed: %s", exc)
            return jsonify({"success": False, "message": "DB error"}), 500
        finally:
            cur.close()

        if affected == 0:
            return jsonify({"success": False, "message": "Not found"}), 404

        return jsonify({"success": True, "message": "Enquiry archived."})

    # ── Admin: purge old rate-limit rows ──────────────────────────────────────
    @app.post("/api/admin/purge-rate-limit")
    def purge_rate_limit():
        if not _require_admin(app):
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        from rate_limit import purge_old_windows
        keep_hours = int(request.get_json(silent=True or {}).get("keep_hours", 48))
        deleted    = purge_old_windows(keep_hours=keep_hours)
        return jsonify({"success": True, "deleted": deleted})

    # ── Error handlers ────────────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"success": False, "message": "Not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(500)
    def internal_error(exc):
        log.error("Unhandled exception: %s", exc)
        return jsonify({"success": False, "message": "Internal server error"}), 500


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    application = create_app()
    application.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=application.config["DEBUG"],
    )