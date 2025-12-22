const fs = require('fs');
const path = require('path');
const db = require('./db');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Use a constant integer (any 64-bit int is fine)
const MIGRATION_LOCK_ID = 424242;

module.exports = async function runMigrations() {
  const client = await db.getClient();

  try {
    // 🔒 1️⃣ Acquire advisory lock (BLOCKS other instances)
    await client.query(
      'SELECT pg_advisory_lock($1)',
      [MIGRATION_LOCK_ID]
    );

    // 2️⃣ Start transaction
    await client.query('BEGIN');

    // 3️⃣ Ensure migration tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT now()
      );
    `);

    // 4️⃣ Get applied migrations
    const { rows } = await client.query(
      'SELECT filename FROM schema_migrations'
    );
    const applied = new Set(rows.map(r => r.filename));

    // 5️⃣ Load & sort migrations
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // 6️⃣ Apply migrations
    for (const file of files) {
      if (applied.has(file)) continue;

      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, file),
        'utf8'
      );

      console.log(`📦 Applying migration: ${file}`);
      await client.query(sql);

      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
    }

    // 7️⃣ Commit changes
    await client.query('COMMIT');

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;

  } finally {
    // 🔓 8️⃣ Release advisory lock
    await client.query(
      'SELECT pg_advisory_unlock($1)',
      [MIGRATION_LOCK_ID]
    );

    client.release();
  }
};
