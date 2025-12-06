import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "API running" });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

export default app;