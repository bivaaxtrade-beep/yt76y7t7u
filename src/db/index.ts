import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'database.sqlite'));
export const db = drizzle(sqlite, { schema });
export { schema };
export type DB = typeof db;
export { sqlite };


