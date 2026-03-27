-- ============================================================
-- schema.sql — UNiverse Capital database schema
-- Engine  : InnoDB  |  Charset : utf8mb4 (full Unicode + emoji)
-- All statements are idempotent (IF NOT EXISTS / IF NOT EXISTS)
-- ============================================================

-- ── Database ─────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS universe_capital
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE universe_capital;

-- ── enquiries ─────────────────────────────────────────────────
-- Stores every contact/enquiry form submission from the website.
CREATE TABLE IF NOT EXISTS enquiries (
    id                  BIGINT UNSIGNED      NOT NULL AUTO_INCREMENT,
    full_name           VARCHAR(120)         NOT NULL,
    email               VARCHAR(254)         NOT NULL,
    phone               VARCHAR(25)                   DEFAULT NULL,
    investor_type       ENUM(
                            'Quant / Developer',
                            'Prop Trader / Fund Manager',
                            'Mentor / Advisor',
                            'Early Stage Investor',
                            'Interested / Curious'
                        )                    NOT NULL,
    investment_horizon  ENUM(
                            '1 – 2 Years',
                            '2 – 5 Years',
                            '5+ Years'
                        )                    NOT NULL,
    message             TEXT                          DEFAULT NULL,
    -- Metadata
    ip_address          VARCHAR(45)                   DEFAULT NULL  COMMENT 'IPv4 or IPv6',
    user_agent          VARCHAR(512)                  DEFAULT NULL,
    status              ENUM('new','read','replied','archived')
                                             NOT NULL DEFAULT 'new',
    notes               TEXT                          DEFAULT NULL  COMMENT 'Internal admin notes',
    submitted_at        DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_email          (email),
    INDEX idx_submitted_at   (submitted_at),
    INDEX idx_status         (status),
    INDEX idx_investor_type  (investor_type)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Website contact/enquiry form submissions';

-- ── rate_limit_log ────────────────────────────────────────────
-- Tracks API call counts per IP per time window to enable
-- application-level rate limiting without Redis.
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ip_address  VARCHAR(45)     NOT NULL,
    endpoint    VARCHAR(100)    NOT NULL,
    window_key  VARCHAR(30)     NOT NULL COMMENT 'e.g. 2024-01-01_14',
    call_count  INT UNSIGNED    NOT NULL DEFAULT 1,
    last_seen   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_ip_endpoint_window (ip_address, endpoint, window_key),
    INDEX idx_window_key (window_key)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Application-level rate limiting log';

-- ── admin_users ───────────────────────────────────────────────
-- Optional: future admin panel user accounts.
CREATE TABLE IF NOT EXISTS admin_users (
    id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    username     VARCHAR(60)     NOT NULL,
    email        VARCHAR(254)    NOT NULL,
    password_hash VARCHAR(256)   NOT NULL  COMMENT 'bcrypt hash',
    is_active    TINYINT(1)      NOT NULL DEFAULT 1,
    last_login   DATETIME                 DEFAULT NULL,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_username (username),
    UNIQUE KEY uq_email    (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Admin panel users';

-- ── schema_migrations ─────────────────────────────────────────
-- Tracks which migrations have been applied.
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     VARCHAR(20)  NOT NULL,
    applied_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (version)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Seed the initial migration version
INSERT IGNORE INTO schema_migrations (version) VALUES ('001_initial');