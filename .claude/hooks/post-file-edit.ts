/**
 * PAI Post-File-Edit Hook
 *
 * Automatically runs quick validation after file edits/writes
 * - Static analysis (TypeScript, ESLint) on changed files
 * - Quick DGTS pattern scan
 * - Zero Tolerance anti-pattern check
 *
 * Triggers: After Edit, Write, MultiEdit tools
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface HookContext {
  tool: string;
  file_path?: string;
  files?: string[];
}

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

function getChangedFiles(context: HookContext): string[] {
  const files: string[] = [];

  if (context.file_path) {
    files.push(context.file_path);
  }

  if (context.files) {
    files.push(...context.files);
  }

  return files.filter(f => fs.existsSync(f));
}

function runQuickValidation(files: string[]) {
  if (files.length === 0) {
    return;
  }

  log('\n[PAI Quick Validation] Running post-edit checks...', 'cyan');

  const results: Array<{ name: string; status: 'PASS' | 'FAIL' | 'SKIP'; message?: string }> = [];

  // 1. Zero Tolerance Pattern Check
  try {
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(file, 'utf-8');

        // Check for console.log
        if (content.includes('console.log') || content.includes('console.error') || content.includes('console.warn')) {
          results.push({
            name: 'Zero Tolerance',
            status: 'FAIL',
            message: `Found console.* statements in ${path.basename(file)}`,
          });
          log(`  ✗ FAIL: Console statements found in ${path.basename(file)}`, 'red');
          continue;
        }

        // Check for undefined error references in catch blocks
        const catchBlockPattern = /catch\s*\([^)]*\)\s*{[^}]*}/g;
        const catchBlocks = content.match(catchBlockPattern) || [];

        for (const block of catchBlocks) {
          if (!block.includes('error') && !block.includes('err') && !block.includes('e)')) {
            results.push({
              name: 'Zero Tolerance',
              status: 'FAIL',
              message: `Catch block without error parameter in ${path.basename(file)}`,
            });
            log(`  ✗ FAIL: Catch block without error parameter in ${path.basename(file)}`, 'red');
            continue;
          }
        }

        // Check for void error anti-pattern
        if (content.includes('void _error') || content.includes('void error')) {
          results.push({
            name: 'Zero Tolerance',
            status: 'FAIL',
            message: `Void error anti-pattern found in ${path.basename(file)}`,
          });
          log(`  ✗ FAIL: Void error anti-pattern in ${path.basename(file)}`, 'red');
          continue;
        }
      }
    }

    if (results.filter(r => r.status === 'FAIL').length === 0) {
      results.push({ name: 'Zero Tolerance', status: 'PASS' });
      log('  ✓ Zero Tolerance patterns check passed', 'green');
    }
  } catch (error) {
    log(`  ⚠ Zero Tolerance check failed: ${error}`, 'yellow');
  }

  // 2. TypeScript Quick Check (if TypeScript files)
  const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  if (tsFiles.length > 0 && fs.existsSync('tsconfig.json')) {
    try {
      execSync(`npx tsc --noEmit ${tsFiles.join(' ')}`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      results.push({ name: 'TypeScript', status: 'PASS' });
      log('  ✓ TypeScript check passed', 'green');
    } catch (error: any) {
      results.push({
        name: 'TypeScript',
        status: 'FAIL',
        message: 'Type errors detected',
      });
      log('  ✗ FAIL: TypeScript errors detected', 'red');
      if (error.stdout) {
        console.log(error.stdout.toString());
      }
    }
  }

  // 3. ESLint Quick Check (if lintable files)
  const lintableFiles = files.filter(f =>
    f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')
  );

  if (lintableFiles.length > 0 && (fs.existsSync('.eslintrc.json') || fs.existsSync('.eslintrc.js'))) {
    try {
      execSync(`npx eslint ${lintableFiles.join(' ')}`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      results.push({ name: 'ESLint', status: 'PASS' });
      log('  ✓ ESLint check passed', 'green');
    } catch (error: any) {
      results.push({
        name: 'ESLint',
        status: 'FAIL',
        message: 'Linting errors detected',
      });
      log('  ✗ FAIL: ESLint errors detected', 'red');
      if (error.stdout) {
        console.log(error.stdout.toString());
      }
    }
  }

  // 4. DGTS Quick Pattern Scan
  try {
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const gamingPatterns = [
        { pattern: /return\s+["']mock[_-]?data["']/gi, name: 'Mock data return' },
        { pattern: /assert\s+[Tt]rue\s*$/gm, name: 'Meaningless assertion' },
        { pattern: /if\s*\(\s*[Ff]alse\s*\)/g, name: 'Disabled code block' },
        { pattern: /\/\/\s*validation[_-]?required/gi, name: 'Commented validation' },
        { pattern: /pass\s*#\s*TODO/g, name: 'Stub function' },
      ];

      for (const { pattern, name } of gamingPatterns) {
        if (pattern.test(content)) {
          results.push({
            name: 'DGTS',
            status: 'FAIL',
            message: `Gaming pattern detected: ${name} in ${path.basename(file)}`,
          });
          log(`  ✗ FAIL: DGTS - ${name} in ${path.basename(file)}`, 'red');
        }
      }
    }

    if (results.filter(r => r.name === 'DGTS' && r.status === 'FAIL').length === 0) {
      results.push({ name: 'DGTS', status: 'PASS' });
      log('  ✓ DGTS gaming patterns check passed', 'green');
    }
  } catch (error) {
    log(`  ⚠ DGTS check failed: ${error}`, 'yellow');
  }

  // Summary
  const failed = results.filter(r => r.status === 'FAIL');
  if (failed.length > 0) {
    log(`\n[PAI Quick Validation] ${failed.length} check(s) failed - fix before commit`, 'red');
    log('Run full validation: node scripts/validation/pai-orchestrator.js', 'cyan');
  } else {
    log('\n[PAI Quick Validation] All quick checks passed ✓', 'green');
  }
}

// Hook execution
export default function hook(context: HookContext) {
  try {
    const changedFiles = getChangedFiles(context);

    if (changedFiles.length > 0) {
      runQuickValidation(changedFiles);
    }
  } catch (error) {
    log(`[PAI Quick Validation] Hook error: ${error}`, 'yellow');
  }
}
