-- ============================================================
-- schema.sql  --  UNiverse Capital table definitions
--
-- The database is created automatically by db.py before this
-- file runs, so there is no CREATE DATABASE or USE statement
-- here.  Every statement is idempotent (IF NOT EXISTS /
-- INSERT IGNORE) -- safe to re-execute on every startup.
-- ============================================================

-- ---- enquiries ---------------------------------------------
CREATE TABLE IF NOT EXISTS enquiries (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name           VARCHAR(120)    NOT NULL,
    email               VARCHAR(254)    NOT NULL,
    phone               VARCHAR(25)              DEFAULT NULL,
    investor_type       VARCHAR(60)     NOT NULL
                            COMMENT 'Quant / Developer | Prop Trader / Fund Manager | Mentor / Advisor | Early Stage Investor | Interested / Curious',
    investment_horizon  VARCHAR(30)     NOT NULL
                            COMMENT '1-2 Years | 2-5 Years | 5+ Years',
    message             TEXT                     DEFAULT NULL,
    ip_address          VARCHAR(45)              DEFAULT NULL COMMENT 'IPv4 or IPv6',
    user_agent          VARCHAR(512)             DEFAULT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'new'
                            COMMENT 'new | read | replied | archived',
    notes               TEXT                     DEFAULT NULL COMMENT 'Internal admin notes',
    submitted_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                 ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_email         (email),
    INDEX idx_submitted_at  (submitted_at),
    INDEX idx_status        (status),
    INDEX idx_investor_type (investor_type)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Website contact/enquiry form submissions';

-- ---- rate_limit_log ----------------------------------------
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ip_address  VARCHAR(45)     NOT NULL,
    endpoint    VARCHAR(100)    NOT NULL,
    window_key  VARCHAR(30)     NOT NULL COMMENT 'YYYY-MM-DD_HH in UTC',
    call_count  INT UNSIGNED    NOT NULL DEFAULT 1,
    last_seen   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_ip_endpoint_window (ip_address, endpoint, window_key),
    INDEX idx_window_key (window_key)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Application-level rate limiting (no Redis needed)';

-- ---- admin_users -------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    username      VARCHAR(60)   NOT NULL,
    email         VARCHAR(254)  NOT NULL,
    password_hash VARCHAR(256)  NOT NULL COMMENT 'bcrypt hash',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    last_login    DATETIME               DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_username (username),
    UNIQUE KEY uq_email    (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Admin panel users';

-- ---- schema_migrations -------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
    version    VARCHAR(20) NOT NULL,
    applied_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (version)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version) VALUES ('001_initial');