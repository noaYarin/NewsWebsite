import "dotenv/config";
import express from "express";
import cors from "cors";
import * as http from "http";
import morgan from "morgan";
import { router as newsRouter } from "./routes/NewsRouter.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/News", newsRouter);

// 404 fallback
app.all("/*splat", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));
