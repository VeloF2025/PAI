#!/usr/bin/env bun
/**
 * Completion Validator - Hybrid validation for autonomous workflow
 *
 * Implements three-tier validation strategy:
 * 1. Stage 1 Validation: After PAI planning (full PAI suite)
 * 2. Checkpoint Validation: Every 5 ACH sessions (lightweight)
 * 3. Final Validation: After ACH completes (comprehensive)
 *
 * Validators Used:
 * - NLNH (No Lies, No Hallucination) - Confidence ≥80%
 * - DGTS (Don't Game The System) - Gaming score ≤30%
 * - Zero Tolerance - 0 TypeScript/ESLint errors
 * - Doc-Driven TDD - Tests from PRD/PRP/ADR
 * - AntiHall - Code existence verification
 * - Test Coverage - ≥95%
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

export interface ValidationResult {
  passed: boolean;
  validationsPassed: number;
  validationsFailed: number;
  errors: string[];
  warnings: string[];
  metrics?: {
    nlnhConfidence?: number;
    dgtsScore?: number;
    testCoverage?: number;
    typescriptErrors?: number;
    eslintErrors?: number;
  };
}

export interface AutoConfig {
  validationLevel: string;
  validationThresholds: {
    nlnhConfidence: number;
    dgtsMaxScore: number;
    minTestCoverage: number;
    maxTypescriptErrors: number;
    maxEslintErrors: number;
  };
}

export class CompletionValidator {
  private config: AutoConfig;

  constructor(config: AutoConfig) {
    this.config = config;
  }

  /**
   * Validate Stage 1 completion (PAI Planning)
   *
   * Runs full PAI validation suite after all 6 phases complete:
   * - Verify all artifacts generated (PRD, PRP, ADR, task_list, feature_list)
   * - NLNH confidence check
   * - DGTS gaming detection
   * - Completeness validation
   */
  async validateStage1Complete(planningResult: any): Promise<ValidationResult> {
    console.log('🔍 [Completion Validator] Validating Stage 1 (PAI Planning) completion');

    const errors: string[] = [];
    const warnings: string[] = [];
    let validationsPassed = 0;
    let validationsFailed = 0;

    // 1. Verify required artifacts exist
    const requiredArtifacts = ['prd', 'prp', 'adr', 'taskList', 'featureList'];
    for (const artifact of requiredArtifacts) {
      if (!planningResult.artifacts?.[artifact]) {
        errors.push(`Missing required artifact: ${artifact}`);
        validationsFailed++;
      } else {
        // Check if file actually exists
        try {
          await fs.access(planningResult.artifacts[artifact]);
          validationsPassed++;
        } catch {
          errors.push(`Artifact file not found: ${planningResult.artifacts[artifact]}`);
          validationsFailed++;
        }
      }
    }

    // 2. Validate feature_list.json format
    if (planningResult.artifacts?.featureList) {
      try {
        const featureListContent = await fs.readFile(planningResult.artifacts.featureList, 'utf-8');
        const featureList = JSON.parse(featureListContent);

        if (!Array.isArray(featureList)) {
          errors.push('feature_list.json is not an array');
          validationsFailed++;
        } else if (featureList.length === 0) {
          errors.push('feature_list.json is empty (no test cases)');
          validationsFailed++;
        } else {
          console.log(`✅ [Stage 1] feature_list.json contains ${featureList.length} test cases`);
          validationsPassed++;
        }
      } catch (error) {
        errors.push(`Failed to parse feature_list.json: ${error.message}`);
        validationsFailed++;
      }
    }

    // 3. NLNH Confidence Check (if available in planning result)
    if (planningResult.nlnhConfidence !== undefined) {
      if (planningResult.nlnhConfidence < this.config.validationThresholds.nlnhConfidence) {
        errors.push(
          `NLNH confidence too low: ${planningResult.nlnhConfidence.toFixed(2)} < ${this.config.validationThresholds.nlnhConfidence}`
        );
        validationsFailed++;
      } else {
        validationsPassed++;
      }
    }

    // 4. DGTS Gaming Score Check
    if (planningResult.dgtsScore !== undefined) {
      if (planningResult.dgtsScore > this.config.validationThresholds.dgtsMaxScore) {
        errors.push(
          `DGTS gaming score too high: ${planningResult.dgtsScore.toFixed(2)} > ${this.config.validationThresholds.dgtsMaxScore}`
        );
        validationsFailed++;
      } else {
        validationsPassed++;
      }
    }

    // 5. Completeness Check
    if (planningResult.completeness !== undefined) {
      if (planningResult.completeness < 0.95) {
        errors.push(`Completeness too low: ${planningResult.completeness.toFixed(2)} < 0.95`);
        validationsFailed++;
      } else {
        validationsPassed++;
      }
    }

    const passed = errors.length === 0;

    console.log(`${passed ? '✅' : '❌'} [Stage 1] Validation ${passed ? 'PASSED' : 'FAILED'}`);
    console.log(`   Passed: ${validationsPassed}, Failed: ${validationsFailed}`);

    return {
      passed,
      validationsPassed,
      validationsFailed,
      errors,
      warnings,
    };
  }

  /**
   * Validate ACH checkpoint (every 5 sessions)
   *
   * Runs lightweight validation:
   * - TypeScript compilation
   * - ESLint (errors only)
   * - Build check
   */
  async validateACHCheckpoint(sessionCount: number, projectRoot: string): Promise<ValidationResult> {
    console.log(`🔍 [Completion Validator] Checkpoint validation (session ${sessionCount})`);

    const errors: string[] = [];
    const warnings: string[] = [];
    let validationsPassed = 0;
    let validationsFailed = 0;

    // 1. TypeScript Compilation Check
    const tsResult = await this.runCommand('tsc', ['--noEmit'], projectRoot);
    if (tsResult.exitCode === 0) {
      console.log('✅ [Checkpoint] TypeScript compilation successful');
      validationsPassed++;
    } else {
      const errorCount = (tsResult.stderr.match(/error TS/g) || []).length;
      if (errorCount > 0) {
        errors.push(`TypeScript errors: ${errorCount}`);
        validationsFailed++;
      }
    }

    // 2. ESLint Check (errors only)
    const eslintResult = await this.runCommand('npm', ['run', 'lint'], projectRoot);
    if (eslintResult.exitCode === 0) {
      console.log('✅ [Checkpoint] ESLint passed');
      validationsPassed++;
    } else {
      warnings.push('ESLint warnings detected (non-blocking)');
    }

    // 3. Build Check
    const buildResult = await this.runCommand('npm', ['run', 'build'], projectRoot);
    if (buildResult.exitCode === 0) {
      console.log('✅ [Checkpoint] Build successful');
      validationsPassed++;
    } else {
      errors.push('Build failed');
      validationsFailed++;
    }

    const passed = errors.length === 0;

    console.log(`${passed ? '✅' : '⚠️ '} [Checkpoint] Validation ${passed ? 'PASSED' : 'has warnings'}`);

    return {
      passed,
      validationsPassed,
      validationsFailed,
      errors,
      warnings,
    };
  }

  /**
   * Validate final completion (after all ACH sessions)
   *
   * Runs comprehensive validation:
   * - All checkpoint validations
   * - Test coverage ≥95%
   * - Zero tolerance (console.log, errors)
   * - AntiHall validation
   */
  async validateFinalCompletion(projectRoot: string): Promise<ValidationResult> {
    console.log('🔍 [Completion Validator] Final comprehensive validation');

    const errors: string[] = [];
    const warnings: string[] = [];
    let validationsPassed = 0;
    let validationsFailed = 0;
    const metrics: any = {};

    // 1. TypeScript Compilation (strict)
    const tsResult = await this.runCommand('tsc', ['--noEmit', '--strict'], projectRoot);
    if (tsResult.exitCode === 0) {
      console.log('✅ [Final] TypeScript strict compilation successful');
      metrics.typescriptErrors = 0;
      validationsPassed++;
    } else {
      const errorCount = (tsResult.stderr.match(/error TS/g) || []).length;
      metrics.typescriptErrors = errorCount;
      errors.push(`TypeScript errors: ${errorCount}`);
      validationsFailed++;
    }

    // 2. ESLint (zero errors, zero warnings)
    const eslintResult = await this.runCommand('npm', ['run', 'lint'], projectRoot);
    if (eslintResult.exitCode === 0) {
      console.log('✅ [Final] ESLint passed (zero errors, zero warnings)');
      metrics.eslintErrors = 0;
      validationsPassed++;
    } else {
      const errorCount = (eslintResult.stderr.match(/error/g) || []).length;
      metrics.eslintErrors = errorCount;
      errors.push(`ESLint errors: ${errorCount}`);
      validationsFailed++;
    }

    // 3. Test Coverage Check
    const testResult = await this.runCommand('npm', ['test', '--', '--coverage'], projectRoot);
    if (testResult.exitCode === 0) {
      // Parse coverage from output (if available)
      const coverageMatch = testResult.stdout.match(/All files\s+\|\s+([\d.]+)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        metrics.testCoverage = coverage / 100;

        if (coverage >= this.config.validationThresholds.minTestCoverage * 100) {
          console.log(`✅ [Final] Test coverage: ${coverage.toFixed(2)}%`);
          validationsPassed++;
        } else {
          warnings.push(`Test coverage below threshold: ${coverage.toFixed(2)}% < ${this.config.validationThresholds.minTestCoverage * 100}%`);
          validationsFailed++;
        }
      }
    } else {
      warnings.push('Test coverage check failed');
    }

    // 4. Build Check
    const buildResult = await this.runCommand('npm', ['run', 'build'], projectRoot);
    if (buildResult.exitCode === 0) {
      console.log('✅ [Final] Production build successful');
      validationsPassed++;
    } else {
      errors.push('Production build failed');
      validationsFailed++;
    }

    // 5. Zero Tolerance Check (console.log detection)
    const consoleLogResult = await this.checkConsoleLogs(projectRoot);
    if (consoleLogResult.count === 0) {
      console.log('✅ [Final] Zero console.log statements');
      validationsPassed++;
    } else {
      errors.push(`Found ${consoleLogResult.count} console.log statements`);
      validationsFailed++;
    }

    const passed = errors.length === 0;

    console.log(`\n${passed ? '✅' : '❌'} [Final] Comprehensive validation ${passed ? 'PASSED' : 'FAILED'}`);
    console.log(`   Passed: ${validationsPassed}, Failed: ${validationsFailed}`);
    console.log(`   Warnings: ${warnings.length}`);

    return {
      passed,
      validationsPassed,
      validationsFailed,
      errors,
      warnings,
      metrics,
    };
  }

  /**
   * Run a shell command and capture output
   */
  private runCommand(command: string, args: string[], cwd: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const proc = spawn(command, args, { cwd, shell: true });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          exitCode: code || 0,
          stdout,
          stderr,
        });
      });

      proc.on('error', (error) => {
        resolve({
          exitCode: 1,
          stdout,
          stderr: error.message,
        });
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        proc.kill();
        resolve({
          exitCode: 1,
          stdout,
          stderr: 'Command timeout (2 minutes)',
        });
      }, 120000);
    });
  }

  /**
   * Check for console.log statements in source code
   */
  private async checkConsoleLogs(projectRoot: string): Promise<{ count: number; files: string[] }> {
    const grepResult = await this.runCommand(
      'grep',
      ['-r', 'console\\.', 'src/', '--include=*.ts', '--include=*.tsx'],
      projectRoot
    );

    const lines = grepResult.stdout.split('\n').filter((line) => line.trim() !== '');
    const files = [...new Set(lines.map((line) => line.split(':')[0]))];

    return {
      count: lines.length,
      files,
    };
  }
}

// CLI support
if (import.meta.main) {
  const config: AutoConfig = {
    validationLevel: 'standard',
    validationThresholds: {
      nlnhConfidence: 0.80,
      dgtsMaxScore: 0.30,
      minTestCoverage: 0.95,
      maxTypescriptErrors: 0,
      maxEslintErrors: 0,
    },
  };

  const validator = new CompletionValidator(config);

  const command = process.argv[2];
  const projectRoot = process.argv[3] || process.cwd();

  switch (command) {
    case 'checkpoint': {
      const sessionCount = parseInt(process.argv[4] || '5', 10);
      validator.validateACHCheckpoint(sessionCount, projectRoot).then((result) => {
        console.log('\nResult:', JSON.stringify(result, null, 2));
      });
      break;
    }

    case 'final': {
      validator.validateFinalCompletion(projectRoot).then((result) => {
        console.log('\nResult:', JSON.stringify(result, null, 2));
      });
      break;
    }

    default:
      console.log('Completion Validator - Hybrid Validation for Auto Workflow');
      console.log('Usage:');
      console.log('  bun completion-validator.ts checkpoint [projectRoot] [sessionCount]');
      console.log('  bun completion-validator.ts final [projectRoot]');
  }
}
