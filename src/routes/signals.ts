import { Router, type Response, type Request } from "express";
import { object, string, number, date } from 'yup';
import { createVisitor, createVisitorSignal, fingerprintLookup, updateVisitor } from "../db/visitor.js";
import { parser as utilsParser } from "../utils/index.js";

export const signalRouter = Router();

const captureSchema = object({
    fingerprint_hash: string().optional(),
    user_agent: string().optional(),
    utm_source: string().optional(),
    utm_medium: string().optional(),
    utm_campaign: string().optional(),
    landing_path: string().optional(),
    language: string().optional(),
});

signalRouter.post("/signals", async (req: Request, res: Response) => {
    const { signal } = req.body;

    const validatedData = captureSchema.validateSync(req.body);
    if (!validatedData) {
        return res.status(400).json({ message: "Invalid request body" });
    }

    // fallback to request headers if agent not provided
    const userAgent = validatedData.user_agent ?? (req.headers["user-agent"] as string | undefined);
    const fingerprintHash = validatedData.fingerprint_hash ?? (req.body?.fingerprint as string | undefined);

    // see if visitor exists by fingerprint hash lookup
    let visitor = await fingerprintLookup(fingerprintHash ?? "");

    if (!visitor) {
        // create visitor if no fingerprint hash found
        visitor = await createVisitor(fingerprintHash ?? "").catch((error) => {
            console.error(error);
            return res.status(500).json({ message: "Failed to create visitor" });
        });
    } else {
        // update visitor last seen at and visit count
        await updateVisitor(visitor.id as string);
    }

    await createVisitorSignal(visitor.id as string, signal, userAgent as string).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to create visitor signal" });
    });

    const segment = utilsParser.getSegment(signal);

    const response = {
        status: "success",
        visitor_id: visitor.id,
        fingerprint_hash: fingerprintHash,
        segment,
    }
    res.status(200).json(response);
});
