import express, { type Request, type Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});


// endpoint 1
// POST /api/v1/visitors/signals
app.post("/api/v1/visitors/signals", (req: Request, res: Response) => {
    const { visitorId, signal } = req.body;
    console.log(visitorId, signal);
    res.status(200).json({ message: "Signal received" });
});

// endpoint 2
// GET /api/v1/visitors/:visitorId/personalization
app.get("/api/v1/visitors/:visitorId/personalization", (req: Request, res: Response) => {
    const { visitorId } = req.params;
    console.log(visitorId);
    res.status(200).json({ message: "Personalization received" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;