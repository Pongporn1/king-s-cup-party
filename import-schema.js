// Import schema to Railway MySQL
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importSchema() {
  const connection = await mysql.createConnection({
    host: process.env.RAILWAY_TCP_PROXY_DOMAIN || "shuttle.proxy.rlwy.net",
    port: Number(process.env.RAILWAY_TCP_PROXY_PORT) || 28092,
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "QsgzVclysHheKOXAQZKvgnyADyFFgWCZ",
    database: process.env.MYSQLDATABASE || "railway",
    multipleStatements: true,
  });

  try {
    console.log("📥 Connected to Railway MySQL...");

    const schema = fs.readFileSync(
      path.join(__dirname, "mysql-init", "01-schema.sql"),
      "utf8"
    );

    console.log("📝 Executing schema...");
    await connection.query(schema);

    console.log("✅ Schema imported successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

importSchema();
