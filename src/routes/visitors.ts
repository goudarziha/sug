import { Router, type Request, type Response } from "express";
import { createPersonalizationForVisitor, getVisitorByID, getVisitorSignalByID } from "../db/visitor.js";
import type { IVisitor, ISignal } from "../types/index.js";
import { config } from "../config/index.js";
import { now } from "../utils/date.util.js";
import * as utilsParser from "../utils/parser.util.js";

export const visitorRouter = Router();


visitorRouter.get("/:visitorId/personalization", async (req: Request, res: Response) => {
    const { visitorId } = req.params;

    const visitor = await getVisitorByID(visitorId as string);

    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    const signal = await getVisitorSignalByID(visitor.id as string).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to get visitor signal" });
    });

    await createPersonalizationForVisitor(visitor as IVisitor, signal.id as string).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to create personalization" });
    });

    const presonalizationResponseObj = await utilsParser.getPersonalizationForVisitor(visitor.segment).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to get personalization" });
    });

    const response = {
        status: "success",
        visitor_id: visitor.id,
        personalization: presonalizationResponseObj,
        meta: {
            variant_key: visitor.segment,
            rule_version: config.ruleVersion.version,
            created_at: now(),
        }
    }
    res.status(200).json(response);
});