import { v4 as uuidv4 } from "uuid";
import { getDb } from "./database.js";
import { now } from "../utils/date.util.js";


export const fingerprintLookup = async (fingerprintHash: string) => {
    const database = await getDb();
    const visitor = database
        .prepare("SELECT id FROM visitors WHERE fingerprint_hash = ?")
        .get(fingerprintHash);
    console.log(visitor);
    return visitor;
};

export const createVisitor = async (fingerprintHash: string) => {
    const db = await getDb();
    const id = uuidv4();
    const current = now();
    console.log(id, fingerprintHash, current);

    const row = db
        .prepare(
            `INSERT INTO visitors
        (id, fingerprint_hash, created_at, first_seen_at, last_seen_at, visit_count, signal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        )
        .run(id, fingerprintHash, current, current, current, 0, "");

    const resp = db.prepare("SELECT * FROM visitors WHERE id = ?").get(id);

    console.log(row);
    console.log(resp);
    return resp;
}

export const updateVisitor = async (visitorId: string) => {
    const db = await getDb();
    const current = now();
    const row = db
        .prepare(
            `
            UPDATE visitors
            SET last_seen_at = ?, visit_count = visit_count + 1
            WHERE id = ?
            `,
        )
        .run(current, visitorId);
    return row;
}

export const createVisitorSignal = async (visitorId: string, signal: string, userAgent: string) => {
    const db = await getDb();
    const current = now();
    const row = db
        .prepare(
            `
            INSERT INTO visitor_signals (visitor_id, signal, created_at)
            VALUES (?, ?, ?)
            `,
        )
        .run(visitorId, signal, current);
    return row;
}