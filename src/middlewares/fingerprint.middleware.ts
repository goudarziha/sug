import type { NextFunction, Request, Response } from "express";
import { hashFingerprint } from "../utils/hash.util.js";

export function fingerprintMiddleware(req: Request, res: Response, next: NextFunction): void {
    const serverData = {
        userAgent: req.headers["user-agent"],
        language: req.headers["accept-language"],
    };
    const clientData = {
        screenResolution: req.body?.["screen-resolution"],
        timezone: req.body?.timezone,
    };
    const fingerprint = hashFingerprint(serverData, clientData);
    res.locals.fingerprint = fingerprint;
    if (typeof req.body === "object" && req.body !== null) {
        (req.body as Record<string, unknown>).fingerprint = fingerprint;
    }

    next();
}
