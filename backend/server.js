
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import progressRoutes from "./routes/progressRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse JSON request bodies
app.use(express.json());

// Serve your existing frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Reuse the MongoDB connection
let connectionPromise;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured in .env");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(process.env.MONGODB_URI)
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    await connectionPromise;
}

// Connect to MongoDB before handling API requests
app.use("/progress", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        res.status(503).json({
            message: "Database connection failed"
        });
    }
});

// Keep your existing GET, POST and DELETE routes
app.use("/progress", progressRoutes);

// Start a local server, but let Vercel handle deployed requests
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

export default app;























