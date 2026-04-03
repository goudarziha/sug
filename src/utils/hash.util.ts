import { createHash } from "node:crypto";

// create hash fingerprint for visitor to identify them across sessions
// utilized in middleware
export const hashFingerprint = (
    serverData: Record<string, unknown>,
    clientData: Record<string, unknown>,
): string => {
    const fingerprintData = { ...serverData, ...clientData }
    const fingerprintJson = JSON.stringify(fingerprintData)
    return createHash("sha256").update(fingerprintJson).digest("hex");
};
