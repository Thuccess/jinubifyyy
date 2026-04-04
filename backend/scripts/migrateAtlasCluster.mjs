#!/usr/bin/env node
/**
 * Full Atlas → Atlas (or any MongoDB) migration using mongodump + mongorestore.
 * Preserves all databases, collections, indexes, and BSON types.
 *
 * Prerequisites (install MongoDB Database Tools):
 *   macOS: brew install mongodb-database-tools
 *   https://www.mongodb.com/docs/database-tools/
 *
 * Before you change MONGODB_URI in .env, run:
 *
 *   cd backend
 *   MIGRATE_SOURCE_URI="mongodb+srv://USER:PASS@OLD_HOST/..." \
 *   MIGRATE_TARGET_URI="mongodb+srv://USER:PASS@NEW_HOST/..." \
 *   node scripts/migrateAtlasCluster.mjs
 *
 * Optional:
 *   MIGRATE_BACKUP_PARENT=/absolute/path   (default: backend/backups/migrations)
 *   MIGRATE_NO_DROP=1                        (omit --drop on restore; merges with existing data)
 *
 * After success: update MONGODB_URI to MIGRATE_TARGET_URI (same DB name path as before —
 * if your old URI had no /dbname, data usually lives in `test`; use .../test?retryWrites=...).
 */

import { execFileSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../.env') });

const SOURCE =
  process.env.MIGRATE_SOURCE_URI ||
  process.env.SOURCE_MONGODB_URI ||
  process.env.MONGODB_URI;
const TARGET = process.env.MIGRATE_TARGET_URI || process.env.TARGET_MONGODB_URI;

const BACKUP_PARENT =
  process.env.MIGRATE_BACKUP_PARENT || path.join(__dirname, '../backups/migrations');

function ensureTools() {
  try {
    execFileSync('mongodump', ['--version'], { stdio: 'pipe' });
    execFileSync('mongorestore', ['--version'], { stdio: 'pipe' });
  } catch {
    console.error(
      '[migrate] mongodump / mongorestore not found. Install MongoDB Database Tools:\n' +
        '  brew install mongodb-database-tools\n',
    );
    process.exit(1);
  }
}

function listDumpDatabases(dumpRoot) {
  if (!fs.existsSync(dumpRoot)) return [];
  return fs
    .readdirSync(dumpRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name);
}

function countBsonFiles(dir, acc = { bson: 0, metadata: 0 }) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) countBsonFiles(p, acc);
    else if (name.name.endsWith('.bson')) acc.bson += 1;
    else if (name.name.endsWith('.metadata.json')) acc.metadata += 1;
  }
  return acc;
}

function main() {
  if (!SOURCE || !TARGET) {
    console.error(
      '[migrate] Set MIGRATE_SOURCE_URI and MIGRATE_TARGET_URI (full connection strings).\n' +
        'Example:\n' +
        '  MIGRATE_SOURCE_URI="mongodb+srv://..." MIGRATE_TARGET_URI="mongodb+srv://..." node scripts/migrateAtlasCluster.mjs\n',
    );
    process.exit(1);
  }

  ensureTools();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dumpDir = path.join(BACKUP_PARENT, `dump-${timestamp}`);
  const logPath = path.join(BACKUP_PARENT, `migrate-${timestamp}.log`);
  const logLines = [];

  const log = (msg) => {
    console.log(msg);
    logLines.push(`${new Date().toISOString()} ${msg}`);
  };

  fs.mkdirSync(dumpDir, { recursive: true });

  log(`[migrate] Dump directory: ${dumpDir}`);
  log('[migrate] Step 1/2: mongodump (source cluster — all databases user can access)...');

  try {
    execFileSync('mongodump', ['--uri', SOURCE, '--out', dumpDir], {
             stdio: 'inherit',
           });
  } catch (e) {
    log(`[migrate] ERROR mongodump failed: ${e.message}`);
    fs.writeFileSync(logPath, logLines.join('\n'));
    process.exit(1);
  }

  const dbs = listDumpDatabases(dumpDir);
  log(`[migrate] Dumped databases: ${dbs.length ? dbs.join(', ') : '(none — check source URI / permissions)'}`);
  for (const db of dbs) {
    const counts = countBsonFiles(path.join(dumpDir, db));
    log(`[migrate]   - ${db}: ${counts.bson} .bson file(s), ${counts.metadata} metadata file(s)`);
  }

  const restoreArgs = ['--uri', TARGET];
  if (!process.env.MIGRATE_NO_DROP) {
    restoreArgs.push('--drop');
    log('[migrate] restore will use --drop (set MIGRATE_NO_DROP=1 to merge instead)');
  }
  restoreArgs.push(dumpDir);

  log('[migrate] Step 2/2: mongorestore (target cluster)...');
  try {
    execFileSync('mongorestore', restoreArgs, { stdio: 'inherit' });
  } catch (e) {
    log(`[migrate] ERROR mongorestore failed: ${e.message}`);
    fs.writeFileSync(logPath, logLines.join('\n'));
    process.exit(1);
  }

  log('[migrate] Done. Backup/dump kept at: ' + dumpDir);
  log(
    '[migrate] Set MONGODB_URI to your TARGET string. If old URI had no /dbname, use .../test?... so the app hits the same DB as before.',
  );

  fs.writeFileSync(logPath, logLines.join('\n'));
  console.log(`[migrate] Log written: ${logPath}`);
}

main();
