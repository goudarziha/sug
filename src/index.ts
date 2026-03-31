import { app } from "./app.js";
import { getDb, closeDatabase } from "./db/database.js";
import { config } from "./config/index.js";

getDb();

const server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`rule version: ${config.ruleVersion.version}`);
})

