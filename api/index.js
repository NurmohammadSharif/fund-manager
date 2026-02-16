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

let db, entriesColl, yearsColl, adminColl, initialized = false;

async function connectDB() {
    if (initialized) return;
    await client.connect();
    db = client.db("fundwise");
    entriesColl = db.collection("entries");
    yearsColl = db.collection("years");
    adminColl = db.collection("admin");

    const adminCount = await adminColl.countDocuments();
    if (adminCount === 0) {
        await adminColl.insertOne({
            username: "admin",
            password: "admin123",
            createdAt: new Date().toISOString(),
        });
    }

    initialized = true;
}

// Middleware to ensure DB connection per request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("MongoDB connect error:", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});


app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const admin = await adminColl.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
        password,
    });
    if (admin) res.json({ success: true, username: admin.username });
    else res.status(401).json({ success: false, error: "Invalid credentials" });
});

app.post("/admin/update-password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const admin = await adminColl.findOne({ password: currentPassword });
    if (!admin)
        return res
            .status(401)
            .json({ success: false, error: "Current password incorrect" });

    await adminColl.updateOne(
        { _id: admin._id },
        { $set: { password: newPassword, updatedAt: new Date().toISOString() } }
    );
    res.json({ success: true });
});

app.get("/data", async (req, res) => {
    try {
        const years = await yearsColl.find({}).toArray();
        const entries = await entriesColl.find({}).toArray();
        res.json({ years, entries });
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.post("/entries", async (req, res) => {
    try {
        const entry = req.body;
        if (entry.id)
            await entriesColl.updateOne({ id: entry.id }, { $set: entry }, { upsert: true });
        else await entriesColl.insertOne(entry);
        res.json({ success: true });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ error: "Failed to save entry" });
    }
});

app.delete("/entries/:id", async (req, res) => {
    try {
        await entriesColl.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete entry" });
    }
});

export default async (req, res) => {
    // Vercel already parses the body, so attach it to req for Express
    if (req.body && !req._body) {
        req._body = true;
    }
    // Strip /api prefix since Express routes don't include it
    req.url = req.url.replace(/^\/api/, '');
    if (!req.url || req.url === '') req.url = '/';
    return app(req, res);
};
