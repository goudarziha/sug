import express, { type NextFunction, type Request, type Response } from "express";
import { fingerprintMiddleware } from "./middlewares/fingerprint.middleware.js";
import { config } from "./config/index.js";
import { signalRouter, visitorRouter } from "./routes/index.js";

export const app = express();

// error handling

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('error', err.stack);
    res.status(500).send("ERROR: An unexpected error occurred");
});


// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fingerprintMiddleware);
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`INFO: ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// routes

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});

app.get("/health", (req: Request, res: Response) => {
    res.status(200).send("OK");
});

// endpoint 1
// POST /api/v1/visitors/signals
app.use(`/api/${config.apiVersion.version}/visitors/signals`, signalRouter);
// app.post("/api/v1/visitors/signals", (req: Request, res: Response) => {
// const { visitorId, signal } = req.body;
// console.log(visitorId, signal);
// const fingerprint = res.locals.fingerprint;


// // db.all("INSERT INTO visitors (id, fingerprint_hash) VALUES (?, ?)", [visitorId, signal], (err, rows) => {
// //     if (err) {
// //         console.error("Error inserting signal:", err);
// //         res.status(500).json({ message: "Error inserting signal" });
// //     }
// //     res.send(rows);
// // });

// res.status(200).json({ message: "Signal received" });
// });

// endpoint 2
// GET /api/v1/visitors/:visitorId/personalization
app.use(`/api/${config.apiVersion.version}/visitors/:visitorId/personalization`, visitorRouter);
app.get("/api/v1/visitors/:visitorId/personalization", (req: Request, res: Response) => {
    const { visitorId } = req.params;
    console.log(visitorId);
    res.status(200).json({ message: "Personalization received" });
});

