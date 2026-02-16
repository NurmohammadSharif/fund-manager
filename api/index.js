import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db;
let entriesColl;
let yearsColl;
let adminColl;
let initialized = false;

async function connectDB() {
    if (initialized) return;

    await client.connect();
    db = client.db("fundwise");
    entriesColl = db.collection("entries");
    yearsColl = db.collection("years");
    adminColl = db.collection("admin");

    // Initialize default admin if none exists
    const adminCount = await adminColl.countDocuments();
    if (adminCount === 0) {
        await adminColl.insertOne({
            username: "admin",
            password: "admin123",
            createdAt: new Date().toISOString(),
        });
        console.log("Initialized default admin: admin / admin123");
    }

    initialized = true;
    console.log("MongoDB connected (Vercel serverless).");
}

// Middleware: ensure DB connection per request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("MongoDB connect error:", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// AUTH: Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const admin = await adminColl.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
        password,
    });

    if (admin) {
        res.json({ success: true, username: admin.username });
    } else {
        res.status(401).json({ success: false, error: "Invalid credentials" });
    }
});

// AUTH: Update Password
app.post("/api/admin/update-password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const admin = await adminColl.findOne({ password: currentPassword });

    if (admin) {
        await adminColl.updateOne(
            { _id: admin._id },
            { $set: { password: newPassword, updatedAt: new Date().toISOString() } }
        );
        res.json({ success: true });
    } else {
        res
            .status(401)
            .json({ success: false, error: "Current password incorrect" });
    }
});

// DATA: Get all data
app.get("/api/data", async (req, res) => {
    try {
        const years = await yearsColl.find({}).toArray();
        const entries = await entriesColl.find({}).toArray();
        res.json({ years, entries });
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// DATA: Save/Update Entry
app.post("/api/entries", async (req, res) => {
    try {
        const entry = req.body;

        if (entry.id) {
            await entriesColl.updateOne(
                { id: entry.id },
                { $set: entry },
                { upsert: true }
            );
        } else {
            await entriesColl.insertOne(entry);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ error: "Failed to save entry" });
    }
});

// DATA: Delete Entry
app.delete("/api/entries/:id", async (req, res) => {
    try {
        await entriesColl.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete entry" });
    }
});

export default app;
