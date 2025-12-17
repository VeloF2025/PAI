#!/usr/bin/env bun

// Simple test hook - just writes to a file to verify hooks run
import { writeFileSync } from 'fs';
import { join } from 'path';

const HOME = process.env.USERPROFILE || process.env.HOME || '';
const logFile = join(HOME, '.claude', 'test-hook.log');

writeFileSync(logFile, `Test hook ran at ${new Date().toISOString()}\n`);

process.exit(0);
