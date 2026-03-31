import Database from "better-sqlite3";
import fs from "fs";
import { config } from "../config/index.js";

// Database schmea

// create visitor table if not exists
// id is a UUIDv4
// fingerprint_hash is client-generated, unique identifier (user-agent, language, screen_resolution, timezone)
// hash allows recognition of the same visitor w/o cookies
const createVisitorTableSql = `
    CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (
            lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
            substr(lower(hex(randomblob(2))), 2) || '-' ||
            substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
            lower(hex(randomblob(6)))
        ),
        fingerprint_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        visit_count INTEGER NOT NULL,
        signal TEXT NOT NULL
    );
`;

const createVisitorFingerprintIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_visitors_fingerprint_hash ON visitors (fingerprint_hash);
`;

// create visitor signals table if not exists
// every new visit generates a new signal, but keeps visitor identity persistent
// id is a UUIDv4
// visitor_id is a FK to the visitors table (1:N)
// utm_medium = "google"
// utm_campaign = "sports,pickleball"
// referrer_domain = "linkedin.com"
// landing_path = "/sports"
const createVisitorSignalsTableSql = `
    CREATE TABLE IF NOT EXISTS visitor_signals (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (
            lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
            substr(lower(hex(randomblob(2))), 2) || '-' ||
            substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
            lower(hex(randomblob(6)))
        ),
        created_by TEXT NOT NULL,
        visitor_id TEXT NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
        signal TEXT NOT NULL,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        referrer_domain TEXT,
        referrer_path TEXT,
        landing_path TEXT,
        user_agent TEXT,
        raw_payload TEXT NOT NULL
    );
`;

const createVisitorSignalsIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_visitor_signals_visitor_id ON visitor_signals (visitor_id);
`;

// create personalization types table if not exists
// id is a UUIDv4
// visitor_id is a FK to the visitors table (1:N)
// signal_id is a FK to the visitor_signals table (1:N)

const createPersonalizationTableSql = `
    CREATE TABLE IF NOT EXISTS personalizations (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (
            lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
            substr(lower(hex(randomblob(2))), 2) || '-' ||
            substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
            lower(hex(randomblob(6)))
        ),
        created_by TEXT NOT NULL,
        visitor_id TEXT NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
        signal_id TEXT NOT NULL REFERENCES visitor_signals(id) ON DELETE CASCADE,
        variant_key TEXT NOT NULL,
        rule_version TEXT NOT NULL
    );
`;

const createPersonalizationIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_personalizations_visitor_id ON personalizations (visitor_id);
`;

// Database initialization and functions

let db: Database.Database | null = null;

async function execSchema(database: Database.Database): Promise<void> {
    database.exec(createVisitorTableSql);
    database.exec(createVisitorFingerprintIndexSql);
    database.exec(createVisitorSignalsTableSql);
    database.exec(createVisitorSignalsIndexSql);
    database.exec(createPersonalizationTableSql);
    database.exec(createPersonalizationIndexSql);
}

export async function getDb(): Promise<Database.Database> {
    if (!db) {
        if (config.dbPath.path && config.dbPath.path !== ":memory:") {
            if (!fs.existsSync(config.dbPath.path)) {
                fs.writeFileSync(config.dbPath.path, "");
            }
        }

        db = new Database(config.dbPath.path);
        db.pragma("foreign_keys = ON");
        //  https://www.sqlite.org/wal.html
        db.pragma("journal_mode = WAL");

        await execSchema(db);
    }
    return db;
}

export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
    }
}
export { db };
