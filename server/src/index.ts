import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const port = Number(process.env.PORT) || 3000;

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword],
    );

    return res.status(201).json({
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Error in register process",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT id, username, password FROM users WHERE username = $1",
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error occured",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});