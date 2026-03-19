const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    name TEXT,
    level INTEGER
  )
`);

app.post("/save-score", async (req, res) => {
  const { name, level } = req.body;

  try {
    await pool.query("INSERT INTO scores (name, level) VALUES ($1, $2)", [
      name,
      level,
    ]);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send(err);
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
