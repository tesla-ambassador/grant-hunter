import Database from "better-sqlite3";
import path from "path";

export interface GrantProgram {
  id: string;
  name: string;
  short_description: string;
  deadline: string;
  link: string;
  imgUrl?: string;
  scraped_at?: string;
}

const dbPath = path.resolve(process.cwd(), "grants.db");
const db: Database.Database = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_description TEXT,
    deadline TEXT,
    link TEXT UNIQUE NOT NULL,
    image_url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
