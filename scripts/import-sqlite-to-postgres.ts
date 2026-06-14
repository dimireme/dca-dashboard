import "dotenv/config";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const DEFAULT_SQLITE_URL = "file:./dev.db";

type SqlitePurchase = {
  id: string;
  date: string;
  amountUsdt: number;
  btcPrice: number;
  btcAmount: number;
  source: string;
  notes: string | null;
  createdAt: string;
};

function sqliteFilePath(url: string): string {
  const prefix = "file:";
  if (!url.startsWith(prefix)) {
    throw new Error(`Unsupported SQLITE_DATABASE_URL format: ${url}`);
  }

  const rawPath = url.slice(prefix.length);
  return resolve(process.cwd(), rawPath.startsWith("./") ? rawPath : `./${rawPath}`);
}

function createPostgresClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function readSqlitePurchases(dbPath: string): SqlitePurchase[] {
  const db = new Database(dbPath, { readonly: true });

  try {
    const tableExists = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Purchase'",
      )
      .get();

    if (!tableExists) {
      return [];
    }

    return db
      .prepare(
        `SELECT id, date, amountUsdt, btcPrice, btcAmount, source, notes, createdAt
         FROM Purchase
         ORDER BY date ASC`,
      )
      .all() as SqlitePurchase[];
  } finally {
    db.close();
  }
}

async function main() {
  const sqliteUrl = process.env.SQLITE_DATABASE_URL ?? DEFAULT_SQLITE_URL;
  const postgresUrl = process.env.DATABASE_URL;

  if (!postgresUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sqlitePath = sqliteFilePath(sqliteUrl);
  if (!existsSync(sqlitePath)) {
    console.log(`SQLite database not found at ${sqlitePath}. Nothing to import.`);
    return;
  }

  const purchases = readSqlitePurchases(sqlitePath);
  if (purchases.length === 0) {
    console.log("SQLite database is empty. Nothing to import.");
    return;
  }

  const postgres = createPostgresClient(postgresUrl);

  try {
    const result = await postgres.purchase.createMany({
      data: purchases.map((purchase) => ({
        id: purchase.id,
        date: new Date(purchase.date),
        amountUsdt: purchase.amountUsdt,
        btcPrice: purchase.btcPrice,
        btcAmount: purchase.btcAmount,
        source: purchase.source,
        notes: purchase.notes,
        createdAt: new Date(purchase.createdAt),
      })),
      skipDuplicates: true,
    });

    const postgresCount = await postgres.purchase.count();

    console.log(`Found ${purchases.length} purchase(s) in SQLite.`);
    console.log(`Imported ${result.count} new purchase(s).`);
    console.log(`Postgres now has ${postgresCount} purchase(s) total.`);
  } finally {
    await postgres.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("SQLite import failed:", error);
  process.exit(1);
});
