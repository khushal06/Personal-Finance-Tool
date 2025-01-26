require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const Joi = require("joi");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const db = new sqlite3.Database("./transactions.db", (err) => {
  if (err) console.error("Error opening database:", err);
  else {
    console.log("Connected to SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL
      )`
    );
  }
});

// Validation schema
const transactionSchema = Joi.object({
  date: Joi.string().required(),
  category: Joi.string().required(),
  amount: Joi.number().required(),
});

// Add transaction
app.post("/transactions", (req, res, next) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { date, category, amount } = req.body;
  db.run(
    `INSERT INTO transactions (date, category, amount) VALUES (?, ?, ?)`,
    [date, category, amount],
    function (err) {
      if (err) return next(err);
      res.status(201).json({ id: this.lastID, date, category, amount });
    }
  );
});

// Fetch all transactions
app.get("/transactions", (req, res, next) => {
  db.all(`SELECT * FROM transactions ORDER BY date DESC`, [], (err, rows) => {
    if (err) return next(err);
    res.status(200).json(rows);
  });
});

// Delete transaction
app.delete("/transactions/:id", (req, res, next) => {
  const { id } = req.params;
  db.run(`DELETE FROM transactions WHERE id = ?`, [id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  });
});

// Update transaction
app.put("/transactions/:id", (req, res, next) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { id } = req.params;
  const { date, category, amount } = req.body;
  db.run(
    `UPDATE transactions SET date = ?, category = ?, amount = ? WHERE id = ?`,
    [date, category, amount, id],
    function (err) {
      if (err) return next(err);
      if (this.changes === 0) return res.status(404).json({ error: "Not found" });
      res.status(200).json({ id, date, category, amount });
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
