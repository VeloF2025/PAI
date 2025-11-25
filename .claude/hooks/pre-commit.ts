/**
 * PAI Pre-Commit Hook
 *
 * Runs FULL validation before any git commit
 * - All NLNH, DGTS, Zero Tolerance, Doc-TDD, AntiHall protocols
 * - Static analysis (TypeScript, ESLint, Python)
 * - Unit tests
 * - E2E tests (if UI project)
 *
 * BLOCKS commit if any critical validation fails
 *
 * Triggers: Before git commit commands
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export default function hook() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║  🛡️  PAI PRE-COMMIT VALIDATION (MANDATORY)            ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  try {
    // Check if orchestrator exists
    if (!fs.existsSync('scripts/validation/pai-orchestrator.js')) {
      log('⚠️  PAI Orchestrator not found - skipping full validation', 'yellow');
      log('   Expected: scripts/validation/pai-orchestrator.js', 'yellow');
      return;
    }

    // Run full validation
    log('Running full PAI validation suite...', 'cyan');
    log('This may take a moment...\n', 'cyan');

    const result = execSync('node scripts/validation/pai-orchestrator.js --verbose', {
      encoding: 'utf-8',
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    log('\n✓ All validations passed - commit approved', 'green');

  } catch (error: any) {
    log('\n╔═══════════════════════════════════════════════════════════╗', 'red');
    log('║  🚫 COMMIT BLOCKED - VALIDATION FAILED                ║', 'red');
    log('╚═══════════════════════════════════════════════════════════╝\n', 'red');

    log('One or more critical validations failed.', 'red');
    log('Please fix the errors above before committing.\n', 'red');

    log('Quick fixes:', 'yellow');
    log('  • Remove console.log statements (Zero Tolerance)', 'yellow');
    log('  • Fix TypeScript/ESLint errors', 'yellow');
    log('  • Ensure all tests pass', 'yellow');
    log('  • Run: node scripts/validation/pai-orchestrator.js --verbose\n', 'cyan');

    // Throw error to block commit
    throw new Error('PAI validation failed - commit blocked');
  }
}
