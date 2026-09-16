const dotenv = require("dotenv");
const express = require("express");
const { neon } = require("@neondatabase/serverless");
const app = express();
const port = 3000;

dotenv.config();
const sql = neon(process.env.DATABASE_URL);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/health", (req, res) => {
    res.send("Server is healthy!");
});

app.get("/urls", async (req, res) => {
    try {
        const userId = req.query.user_id;
        if (!userId) {
            return res
                .status(400)
                .json({ error: "Missing user_id query parameter." });
        }
        const result = await sql`SELECT * FROM urls WHERE user_id = ${userId};`;
        res.json(result);
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Failed to connect to the database." });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            error: "Missing username or password query parameter.",
        });
    }
    const [user] =
        await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password};`;
    if (!user) {
        return res.status(401).json({ error: "Invalid username or password." });
    }
    res.json(user);
});

app.get("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                error: "Missing username or password query parameter.",
            });
        }
        const [user] =
            await sql`INSERT INTO users (username, password) VALUES (${username}, ${password}) RETURNING *;`;
        if (!user) {
            return res.status(500).json({ error: "Failed to register user." });
        }
        res.json(user);
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Failed to connect to the database." });
    }
});

app.post("/add-url", async (req, res) => {
    try {
        const { user_id, url } = req.body;
        if (!user_id || !url) {
            return res
                .status(400)
                .json({ error: "Missing user_id or url query parameter." });
        }
        const [addedUrl] =
            await sql`INSERT INTO urls (user_id, url) VALUES (${user_id}, ${url}) RETURNING *;`;
        if (!addedUrl) {
            return res.status(500).json({ error: "Failed to add URL." });
        }
        res.json(addedUrl);
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Failed to connect to the database." });
    }
});

app.post("/delete-url", async (req, res) => {
    try {
        const { user_id, url_id } = req.body;
        if (!user_id || !url_id) {
            return res
                .status(400)
                .json({ error: "Missing user_id or url_id query parameter." });
        }
        const [deletedUrl] =
            await sql`DELETE FROM urls WHERE user_id = ${user_id} AND id = ${url_id} RETURNING *;`;
        if (!deletedUrl) {
            return res.status(500).json({ error: "Failed to delete URL." });
        }
        res.json(deletedUrl);
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Failed to connect to the database." });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
