import { app } from "./app.js";
import { getDb } from "./db/database.js";
import { config } from "./config/index.js";

getDb();

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port.port}`);
    console.log(`rule version: ${config.ruleVersion.version}`);
    console.log(`api version: ${config.apiVersion.version}`);
})

