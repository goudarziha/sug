import { Router, type Response, type Request } from "express";
import { object, string, number, date } from 'yup';
import { createVisitor, createVisitorSignal, fingerprintLookup, updateVisitor } from "../db/visitor.js";


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

signalRouter.post("/", async (req: Request, res: Response) => {
    const { visitorId, signal } = req.body;

    const rawData = captureSchema.validateSync(req.body);
    if (!rawData) {
        return res.status(400).json({ message: "Invalid request body" });
    }

    const body = rawData;
    const userAgent = body.user_agent ?? (req.headers["user-agent"] as string | undefined);
    const fingerprintHash = body.fingerprint_hash ?? (req.body?.fingerprint as string | undefined);

    console.log(userAgent, fingerprintHash);

    let visitor = await fingerprintLookup(fingerprintHash ?? "");

    if (!visitor) {
        visitor = await createVisitor(fingerprintHash ?? "");
    } else {
        await updateVisitor(visitor.id as string);
    }

    const signal = await createVisitorSignal(visitor.id as string, rawData, userAgent);

    // if (existingVisitor) {
    //     console.log('EXIST', existingVisitor);
    // } else {
    //     const visitor = await createVisitor(fingerprintHash ?? "");
    //     console.log(visitor);
    // }

    res.status(200).json({ message: "Signal received" });
});
