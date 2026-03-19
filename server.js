const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./scores.db");

db.run(`
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  level INTEGER
)
`);

app.post("/save-score", (req, res) => {
  const { name, level } = req.body;

  db.run(
    "INSERT INTO scores (name, level) VALUES (?, ?)",
    [name, level],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send({ success: true });
      }
    },
  );
});

app.get("/leaderboard", (req, res) => {
  db.all(
    "SELECT name, level FROM scores ORDER BY level DESC LIMIT 10",
    [],
    (err, rows) => {
      if (err) res.status(500).send(err);
      else res.json(rows);
    },
  );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
