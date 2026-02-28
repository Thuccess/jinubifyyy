#!/usr/bin/env node
/**
 * Run mongo-express so you can manage MongoDB from the browser.
 * Uses MONGODB_URI from .env, or local MongoDB by default.
 *
 * Usage: npm run mongo-ui
 * Then open: http://localhost:8081
 */

import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinubify';
const env = {
  ...process.env,
  ME_CONFIG_MONGODB_URL: mongoUri,
  ME_CONFIG_SITE_PORT: process.env.MONGO_EXPRESS_PORT || 8081,
};

console.log('Starting mongo-express (MongoDB in the browser)...');
console.log('  MongoDB URI:', mongoUri.replace(/:[^:@]+@/, ':****@'));
console.log('  Open in browser: http://localhost:' + env.ME_CONFIG_SITE_PORT);
console.log('');

const child = spawn('npx', ['mongo-express'], {
  stdio: 'inherit',
  env,
  cwd: path.join(__dirname, '..'),
});

child.on('error', (err) => {
  console.error('Failed to start mongo-express:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
