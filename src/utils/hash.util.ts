import { createHash } from "node:crypto";

export const hashFingerprint = (
    serverData: Record<string, unknown>,
    clientData: Record<string, unknown>,
): string => {
    const fingerprintData = { ...serverData, ...clientData }
    const fingerprintJson = JSON.stringify(fingerprintData)
    return createHash("sha256").update(fingerprintJson).digest("hex");
};
