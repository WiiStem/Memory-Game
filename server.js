const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SERVER IS WORKING WITH ROUTES");
});

console.log("🔥 NEW VERSION DEPLOYED");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        name TEXT,
        level INTEGER
      )
    `);
    console.log("✅ Table ready");
  } catch (err) {
    console.error("❌ Table creation failed:", err);
  }
})();

app.post("/save-score", async (req, res) => {
  const { name, level } = req.body;

  const parsedLevel = Number(level);

  if (!name || isNaN(parsedLevel)) {
    return res.status(400).send({ error: "Invalid input" });
  }

  try {
    await pool.query("INSERT INTO scores (name, level) VALUES ($1, $2)", [
      name,
      parsedLevel,
    ]);

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, level FROM scores ORDER BY level DESC LIMIT 10",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
