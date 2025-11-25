/**
 * PAI Post-Tool-Use Hook
 *
 * Context-aware validation after specific tool uses:
 * - After code implementation: Run quick validation
 * - After test writing: Verify test coverage
 * - After refactoring: Check for regressions
 * - After agent task completion: Run comprehensive validation
 *
 * Provides immediate feedback loop for validation
 *
 * Triggers: After any tool use
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

interface ToolContext {
  tool: string;
  file_path?: string;
  files?: string[];
  task_description?: string;
  agent_name?: string;
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  bright: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function shouldRunValidation(context: ToolContext): { run: boolean; level: 'quick' | 'full' | 'none' } {
  const tool = context.tool.toLowerCase();

  // Code editing tools - quick validation
  if (tool === 'edit' || tool === 'write' || tool === 'multiedit') {
    return { run: true, level: 'quick' };
  }

  // Test-related tools - test coverage validation
  if (context.file_path?.includes('test') || context.file_path?.includes('spec')) {
    return { run: true, level: 'quick' };
  }

  // Agent task completion - full validation
  if (tool === 'task' && context.task_description?.toLowerCase().includes('complet')) {
    return { run: true, level: 'full' };
  }

  // Bash commands that might affect code
  if (tool === 'bash') {
    const bashIndicators = ['npm install', 'npm run build', 'git add', 'pytest', 'npm test'];
    const taskDesc = context.task_description?.toLowerCase() || '';

    if (bashIndicators.some(indicator => taskDesc.includes(indicator))) {
      return { run: true, level: 'quick' };
    }
  }

  return { run: false, level: 'none' };
}

function runValidationLoop(context: ToolContext, level: 'quick' | 'full') {
  log(`\n[PAI Validation Loop] ${level === 'full' ? 'Full' : 'Quick'} validation triggered`, 'cyan');

  try {
    if (level === 'quick') {
      // Quick validation - just critical checks
      runQuickValidation(context);
    } else {
      // Full validation - run orchestrator
      log('Running full PAI validation suite...', 'cyan');

      execSync('node scripts/validation/pai-orchestrator.js', {
        encoding: 'utf-8',
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      log('\n[PAI Validation Loop] ✓ Full validation passed', 'green');
    }
  } catch (error: any) {
    log(`\n[PAI Validation Loop] ✗ Validation failed`, 'red');
    log('Fix errors above before proceeding', 'yellow');

    // Provide retry suggestion
    log('\n💡 Validation Loop Active:', 'cyan');
    log('   1. Fix the errors identified above', 'cyan');
    log('   2. Re-run validation: node scripts/validation/pai-orchestrator.js', 'cyan');
    log('   3. Maximum 3 retry attempts before escalation\n', 'cyan');
  }
}

function runQuickValidation(context: ToolContext) {
  const checks: Array<{ name: string; passed: boolean }> = [];

  // 1. Zero Tolerance Quick Check
  if (context.file_path && (context.file_path.endsWith('.ts') || context.file_path.endsWith('.tsx') ||
      context.file_path.endsWith('.js') || context.file_path.endsWith('.jsx'))) {

    try {
      const content = fs.readFileSync(context.file_path, 'utf-8');

      // Console.log check
      if (content.includes('console.log') || content.includes('console.error')) {
        log('  ✗ Zero Tolerance: Console statements detected', 'red');
        checks.push({ name: 'Console.log', passed: false });
      } else {
        log('  ✓ Zero Tolerance: No console statements', 'green');
        checks.push({ name: 'Console.log', passed: true });
      }

      // Void error anti-pattern
      if (content.includes('void _error') || content.includes('void error')) {
        log('  ✗ Zero Tolerance: Void error anti-pattern detected', 'red');
        checks.push({ name: 'Void error', passed: false });
      } else {
        log('  ✓ Zero Tolerance: No void error anti-patterns', 'green');
        checks.push({ name: 'Void error', passed: true });
      }

      // DGTS gaming patterns
      const gamingPatterns = [
        /return\s+["']mock[_-]?data["']/gi,
        /assert\s+[Tt]rue\s*$/gm,
        /if\s*\(\s*[Ff]alse\s*\)/g,
      ];

      const hasGaming = gamingPatterns.some(pattern => pattern.test(content));
      if (hasGaming) {
        log('  ✗ DGTS: Gaming pattern detected', 'red');
        checks.push({ name: 'DGTS', passed: false });
      } else {
        log('  ✓ DGTS: No gaming patterns', 'green');
        checks.push({ name: 'DGTS', passed: true });
      }

    } catch (error) {
      log(`  ⚠ Could not read file for validation: ${error}`, 'yellow');
    }
  }

  // 2. TypeScript quick check (if applicable)
  if (context.file_path?.endsWith('.ts') || context.file_path?.endsWith('.tsx')) {
    if (fs.existsSync('tsconfig.json')) {
      try {
        execSync(`npx tsc --noEmit ${context.file_path}`, {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
        log('  ✓ TypeScript: No type errors', 'green');
        checks.push({ name: 'TypeScript', passed: true });
      } catch (error) {
        log('  ✗ TypeScript: Type errors detected', 'red');
        checks.push({ name: 'TypeScript', passed: false });
      }
    }
  }

  // Summary
  const failed = checks.filter(c => !c.passed);
  if (failed.length > 0) {
    log(`\n[PAI Validation Loop] ${failed.length} check(s) failed`, 'red');
    log('Run full validation to see all issues: node scripts/validation/pai-orchestrator.js', 'cyan');
  } else {
    log('\n[PAI Validation Loop] ✓ Quick checks passed', 'green');
  }
}

// Hook execution
export default function hook(context: ToolContext) {
  try {
    const { run, level } = shouldRunValidation(context);

    if (run && level !== 'none') {
      // Small delay to allow file writes to complete
      setTimeout(() => {
        runValidationLoop(context, level);
      }, 100);
    }
  } catch (error) {
    log(`[PAI Validation Loop] Hook error: ${error}`, 'yellow');
  }
}
