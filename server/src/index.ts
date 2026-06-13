import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

type TokenPayload = {
  id: number;
  username: string;
};

type AuthRequest = Request & {
  user?: TokenPayload;
};

function createToken(user: TokenPayload) {
  const options: SignOptions = {
    expiresIn: "30m",
  };

  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    JWT_SECRET,
    options,
  );
}

function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid token format",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

const port = Number(process.env.PORT) || 3000;

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword],
    );

    const user = result.rows[0];
    const token = createToken({
      id: user.id,
      username: user.username,
    });

    return res.status(201).json({
      message: "Registration successful",
      user,
      token,
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

    const token = createToken({
      id: user.id,
      username: user.username,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error occured",
    });
  }
});

app.get(
  "/api/transactions",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const userId = req.user.id;

      const result = await pool.query(
        `
      SELECT
        id,
        type,
        title,
        amount,
        category,
        to_char(transaction_date, 'YYYY-MM-DD') AS transaction_date,
        created_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY transaction_date DESC, created_at DESC
      `,
        [userId],
      );

      const transactions = result.rows.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
      }));

      const incomes = transactions.filter(
        (transaction) => transaction.type === "income",
      );

      const expenses = transactions.filter(
        (transaction) => transaction.type === "expense",
      );

      const totalIncome = incomes.reduce((sum, transaction) => {
        return sum + transaction.amount;
      }, 0);

      const totalExpenses = expenses.reduce((sum, transaction) => {
        return sum + transaction.amount;
      }, 0);

      return res.json({
        user: req.user,
        incomes,
        expenses,
        totals: {
          income: totalIncome,
          expense: totalExpenses,
          balance: totalIncome - totalExpenses,
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message: "Error fetching transactions",
      });
    }
  },
);

app.post(
  "/api/transactions",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { type, title, amount, category } = req.body;
      const numAmount = Number(amount);

      const result = await pool.query(
        `
        INSERT INTO transactions (user_id,title,amount,type,category)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING
          id,
          user_id,
          title,
          amount,
          type,
          category,
          to_char(transaction_date, 'YYYY-MM-DD') AS transaction_date,
          created_at
        `,
        [req.user?.id, title, numAmount, type, category],
      );
      res.status(200).json({
        message:"transaction added successfully",
        transaction: result.rows[0]
      })
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Something went wrong.",
      });
    }
  },
);

app.get("/api/me", verifyToken, async (req: AuthRequest, res) => {
  return res.json({
    message: "You are verified.",
    user: req.user,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
