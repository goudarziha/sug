// Configuration for the application

export const config = {
    dbPath: {
        path: process.env.DB_PATH as string || "sug.db",
    },
    port: {
        port: process.env.PORT as string || "3000",
    },
    apiVersion: {
        version: process.env.API_VERSION as string || "v1",
    },
    ruleVersion: {
        version: process.env.RULE_VERSION as string || "1.0",
    },
} as const