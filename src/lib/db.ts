import Database from 'better-sqlite3';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

// Applies the hand-written .sql files of `migrations/` in name order, once each
function migrate(db: Database.Database) {
    db.exec(
        'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL) STRICT',
    );
    const isApplied = db
        .prepare('SELECT 1 FROM schema_migrations WHERE name = ?')
        .pluck();
    const markApplied = db.prepare(
        'INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)',
    );

    const names = readdirSync(MIGRATIONS_DIR)
        .filter((name) => name.endsWith('.sql'))
        .sort();

    for (const name of names) {
        // Checked inside the write lock so two processes starting together don't both apply it
        db.transaction(() => {
            if (isApplied.get(name)) return;
            db.exec(readFileSync(path.join(MIGRATIONS_DIR, name), 'utf8'));
            markApplied.run(name, new Date().toISOString());
        }).immediate();
    }
}

export function openDatabase(file: string): Database.Database {
    mkdirSync(path.dirname(file), { recursive: true });
    const db = new Database(file);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    migrate(db);
    return db;
}

// Kept on globalThis so dev hot reloads reuse the connection instead of leaking one per reload
const globalForDb = globalThis as typeof globalThis & {
    visionDb?: Database.Database;
};

export function getDatabase(): Database.Database {
    globalForDb.visionDb ??= openDatabase(
        process.env.DATABASE_PATH ??
            path.join(process.cwd(), 'data', 'vision.db'),
    );
    return globalForDb.visionDb;
}
