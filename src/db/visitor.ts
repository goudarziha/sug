import { v4 as uuidv4 } from "uuid";
import { getDb } from "./database.js";
import { now } from "../utils/date.util.js";
import type { ISignal, IVisitor } from "../types/index.js";
import { config } from "../config/index.js";


// visitor db queries 
// can be updated for more detailed tracking and analysis in future

// lookup visitor by fingerprint hash
export const fingerprintLookup = async (fingerprintHash: string) => {
    const db = await getDb();
    const visitor = db
        .prepare("SELECT id FROM visitors WHERE fingerprint_hash = ?")
        .get(fingerprintHash);
    return visitor;
};

// create visitor, this is the main visitor row that will be unique per visitor, used to track visitor data
export const createVisitor = async (fingerprintHash: string) => {
    const db = await getDb();
    const id = uuidv4();
    const current = now();

    db.prepare(
        `INSERT INTO visitors
        (id, fingerprint_hash, created_at, last_seen_at, visit_count, segment)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
    )
        .run(id, fingerprintHash, current, current, 0, "default");

    return db.prepare("SELECT * FROM visitors WHERE id = ?").get(id);
}

// update visitor last seen at and visit count
export const updateVisitor = async (visitorId: string) => {
    const db = await getDb();
    const row = db
        .prepare(
            `
            UPDATE visitors
            SET last_seen_at = ?, visit_count = visit_count + 1
            WHERE id = ?
            `,
        )
        .run(now(), visitorId);
    return row;
}

// create visitor signal, this is the main signal that will be used to determine the variant key for the personalization
export const createVisitorSignal = async (visitorId: string, signal: ISignal, userAgent: string) => {
    const db = await getDb();
    const {
        utm_source,
        utm_medium,
        utm_campaign,
        referrer_domain,
        referrer_path,
        landing_path,
        language
    } = signal;
    const row = db
        .prepare(
            `
            INSERT INTO visitor_signals 
            (id, visitor_id, created_at, utm_source, utm_medium, utm_campaign, referrer_domain, referrer_path, landing_path, user_agent, language, raw_payload)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        )
        .run(
            uuidv4(),
            visitorId,
            now(),
            utm_source ?? null,
            utm_medium ?? null,
            utm_campaign ?? null,
            referrer_domain ?? null,
            referrer_path ?? null,
            landing_path ?? null,
            userAgent ?? null,
            language ?? null,
            JSON.stringify(signal ?? {}));
    return row;
}

// update visitor segment, default is 'default'
// updates based on the most recent signal for a visitor
// can be updated to use aggregate signals in future to see trends and patterns
export const updateVisitorSegment = async (visitorId: string, segment: string) => {
    const db = await getDb();
    const row = db
        .prepare("UPDATE visitors SET segment = ? WHERE id = ?")
        .run(segment, visitorId);
    return row;
}

// get visitor by id
export const getVisitorByID = async (visitorId: string) => {
    const db = await getDb();
    const visitor = db
        .prepare("SELECT * FROM visitors WHERE id = ?")
        .get(visitorId);
    return visitor;
}

// get the most recent signal for a visitor
// this can be changed to get the aggregate signals for a visitor in future to see trends and patterns
export const getVisitorSignalByID = async (visitorId: string) => {
    const db = await getDb();
    const signal = db
        .prepare("SELECT * FROM visitor_signals WHERE visitor_id = ? ORDER BY created_at DESC LIMIT 1")
        .get(visitorId);
    return signal;
}
// / TODO:
// can add more functions to get aggregate signals by visitor id

// create personalization report for visitor, will determine the variant key to use for the personalization
export const createPersonalizationForVisitor = async (visitor: IVisitor, signalId: string) => {
    const db = await getDb();
    const { id: visitorId, segment } = visitor;
    if (!visitorId || !segment) {
        throw new Error("Visitor ID or segment is required");
    }
    const ruleVersion = config.ruleVersion.version;
    if (!ruleVersion) {
        throw new Error("Rule version is required");
    }
    const variantKey = segment;
    const row = db
        .prepare("INSERT INTO personalizations (visitor_id, created_at, signal_id, variant_key, rule_version) VALUES (?, ?, ?, ?, ?)")
        .run(visitorId, now(), signalId, variantKey, ruleVersion);
    return row;
}