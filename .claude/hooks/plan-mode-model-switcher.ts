#!/usr/bin/env bun
/**
 * Plan Mode Model Switcher Hook
 * ==============================
 *
 * Automatically switches Claude model based on plan mode:
 * - EnterPlanMode → Switch to Opus 4.5 (better reasoning for planning)
 * - ExitPlanMode → Switch back to Sonnet 4.5 (faster for implementation)
 *
 * Usage:
 * - Called automatically via PreToolUse hook (EnterPlanMode)
 * - Called automatically via PostToolUse hook (ExitPlanMode)
 */

import * as fs from 'fs';
import * as path from 'path';

const SETTINGS_PATH = 'C:/Users/HeinvanVuuren/.claude/settings.json';
const BACKUP_PATH = 'C:/Users/HeinvanVuuren/.claude/.settings.backup.json';

interface Settings {
  model: string;
  [key: string]: any;
}

/**
 * Read settings from file
 */
function readSettings(): Settings {
  try {
    const content = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to read settings.json:', error);
    process.exit(1);
  }
}

/**
 * Write settings to file
 */
function writeSettings(settings: Settings): void {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('❌ Failed to write settings.json:', error);
    process.exit(1);
  }
}

/**
 * Backup current settings
 */
function backupSettings(settings: Settings): void {
  try {
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.warn('⚠️  Failed to backup settings:', error);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args[0]; // 'enter' or 'exit'

  const settings = readSettings();
  const currentModel = settings.model;

  if (mode === 'enter') {
    // Entering planning mode - switch to Opus
    if (currentModel === 'opus') {
      console.log('\n╔═══════════════════════════════════════════════════════╗');
      console.log('║  ✅ ALREADY USING OPUS 4.5 FOR PLANNING MODE        ║');
      console.log('╚═══════════════════════════════════════════════════════╝\n');
      return;
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  🔄 MODEL SWITCH: ENTERING PLANNING MODE             ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║  FROM: ${currentModel.toUpperCase().padEnd(45)} ║`);
    console.log('║  TO:   OPUS 4.5                                       ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log('║  REASON: Better reasoning for planning & architecture║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Backup current settings
    backupSettings(settings);

    // Switch to Opus
    settings.model = 'opus';
    writeSettings(settings);

    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  ✅ NOW USING: OPUS 4.5 (PLANNING MODE)              ║');
    console.log('║  Will auto-switch back to Sonnet when you exit       ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

  } else if (mode === 'exit') {
    // Exiting planning mode - switch back to Sonnet
    if (currentModel === 'sonnet') {
      console.log('\n╔═══════════════════════════════════════════════════════╗');
      console.log('║  ✅ ALREADY USING SONNET 4.5 FOR IMPLEMENTATION      ║');
      console.log('╚═══════════════════════════════════════════════════════╝\n');
      return;
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  🔄 MODEL SWITCH: EXITING PLANNING MODE              ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║  FROM: ${currentModel.toUpperCase().padEnd(45)} ║`);
    console.log('║  TO:   SONNET 4.5                                     ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log('║  REASON: Faster implementation & cost efficiency     ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Switch back to Sonnet
    settings.model = 'sonnet';
    writeSettings(settings);

    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  ✅ NOW USING: SONNET 4.5 (IMPLEMENTATION MODE)      ║');
    console.log('║  Ready for fast implementation                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

  } else {
    console.error('❌ Invalid mode. Use "enter" or "exit"');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}
