
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import progressRoutes from "./routes/progressRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

// Connect to MongoDB before handling progress requests
let connectionPromise;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured");
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

// Ensure database connection before accessing progress routes
app.use("/progress", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        res.status(503).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

app.use("/progress", progressRoutes);

export default app;
























// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// import progressRoutes from "./routes/progressRoutes.js";

// dotenv.config();

// const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.json());

// app.use(express.static(path.join(__dirname, "../frontend")));

// app.use("/progress", progressRoutes);

// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => {
//         console.log("MongoDB connected successfully");

//         // app.listen(process.env.PORT, () => {
//         //     console.log(`Server running on http://localhost:${process.env.PORT}`);
//         // });
//     })
//     .catch((error) => {
//         console.log("MongoDB connection failed:", error.message);
//     });

// export default app;