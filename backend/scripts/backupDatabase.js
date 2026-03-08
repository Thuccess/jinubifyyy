#!/usr/bin/env node
/**
 * MongoDB backup script using mongodump.
 * Exports the database to backend/backups/ (or BACKUP_DIR env).
 *
 * Usage:
 *   node scripts/backupDatabase.js
 *   BACKUP_DIR=/var/backups/jinubify node scripts/backupDatabase.js
 *
 * Cron example (daily at 02:00):
 *   0 2 * * * cd /path/to/jinubify/backend && node scripts/backupDatabase.js >> logs/backup.log 2>&1
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/jinubify';
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');

function getDbName(uri) {
  try {
    const pathMatch = uri.match(/\/([^/?]+)(\?|$)/);
    return pathMatch ? pathMatch[1] : 'jinubify';
  } catch {
    return 'jinubify';
  }
}

function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.join(BACKUP_DIR, timestamp);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log(`[backup] Starting backup to ${outDir}`);
  try {
    execSync(`mongodump --uri="${MONGODB_URI}" --out="${outDir}"`, {
      stdio: 'inherit',
      maxBuffer: 10 * 1024 * 1024,
    });
    const dbName = getDbName(MONGODB_URI);
    const actualOut = path.join(outDir, dbName);
    if (fs.existsSync(actualOut)) {
      console.log(`[backup] Done. Data in ${actualOut}`);
    } else {
      console.log(`[backup] Done. Output in ${outDir}`);
    }
  } catch (err) {
    console.error('[backup] mongodump failed:', err.message);
    process.exit(1);
  }
}

main();
