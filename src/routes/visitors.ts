import { Router, type Request, type Response } from "express";
import { createPersonalizationForVisitor, getVisitorByID, getVisitorSignalByID } from "../db/visitor.js";
import type { IVisitor, ISignal } from "../types/index.js";
import { config } from "../config/index.js";
import { now } from "../utils/date.util.js";
import * as utilsParser from "../utils/parser.util.js";

export const visitorRouter = Router();


visitorRouter.get("/:visitorId/personalization", async (req: Request, res: Response) => {
    // get visitor id from request params
    const { visitorId } = req.params;

    // get visitor by id
    const visitor = await getVisitorByID(visitorId as string).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to get visitor" });
    });

    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    // get the most recent signal for the visitor
    // canbe updated to get the aggregate signals for the visitor in future to see trends and patterns
    const signal = await getVisitorSignalByID(visitor.id as string).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to get visitor signal" });
    });

    // create personalization for visitor
    // doing this during this call and not the signal call for better performance and consistency
    await createPersonalizationForVisitor(visitor as IVisitor, signal.id as string).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to create personalization" });
    });

    // get personalization for visitor
    // look up personalization for visitor based on the segment
    const presonalizationResponseObj = await utilsParser.getPersonalizationForVisitor(visitor.segment).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "Failed to get personalization" });
    });

    // response object contains data for UI personalization and meta information used for A/B testing and analytics
    const response = {
        status: "success",
        visitor_id: visitor.id,
        personalization: presonalizationResponseObj,
        // meta object for additional information, useful for A/B testing and analytics
        meta: {
            variant_key: visitor.segment,
            // can have multiple rules and variants for more granular analysis in future
            rule_version: config.ruleVersion.version,
            created_at: now(),
        }
    }
    res.status(200).json(response);
});