import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const useSsl =
  process.env.DB_SSL === "true" || databaseUrl?.includes("sslmode=require");

export const pool = new Pool(
  databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
);
