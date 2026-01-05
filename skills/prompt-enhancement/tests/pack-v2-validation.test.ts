/**
 * Pack v2.0 Validation Tests - REVISED APPROACH
 *
 * After discovering MCP server template parsing is broken ({{#eq}} helpers fail),
 * revised strategy to focus on measurable, objective criteria that don't require MCP:
 *
 * 1. Token counts (documentation size)
 * 2. Installation complexity (step counting, time estimation)
 * 3. Documentation structure (completeness, organization)
 * 4. Progressive disclosure effectiveness (session load vs total)
 *
 * User explicitly demanded no stub data, but MCP is broken.
 * Therefore: Test what CAN be objectively measured without MCP.
 */

import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

// Base paths
const SKILL_DIR = 'C:/Users/HeinvanVuuren/.claude/skills/prompt-enhancement';
const ORIGINAL_FORMAT = {
  skillMd: join(SKILL_DIR, 'SKILL.md'),
  quickStart: join(SKILL_DIR, 'QUICK_START.md')
};
const PACK_V2_FORMAT = {
  readme: join(SKILL_DIR, 'PACK_README.md'),
  install: join(SKILL_DIR, 'PACK_INSTALL.md'),
  verify: join(SKILL_DIR, 'PACK_VERIFY.md')
};

/**
 * Rough token estimation: ~4 characters per token (conservative)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Count lines in markdown file (excluding empty lines)
 */
function countContentLines(filePath: string): number {
  if (!existsSync(filePath)) return 0;
  const content = readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(line => line.trim().length > 0).length;
}

/**
 * Count installation steps in documentation
 */
function countInstallationSteps(filePath: string): number {
  if (!existsSync(filePath)) return 0;
  const content = readFileSync(filePath, 'utf-8');

  // Look for numbered steps (1., 2., 3., etc.) or bullet points in installation sections
  const installSection = content.match(/##?\s*(Installation|Setup|Quick Start)[\s\S]*?(?=##|$)/i);
  if (!installSection) return 0;

  const steps = installSection[0].match(/^[\s]*[\d]+\.|^[\s]*-\s/gm);
  return steps ? steps.length : 0;
}

/**
 * Analyze documentation structure
 */
function analyzeStructure(filePath: string): {
  hasQuickStart: boolean;
  hasExamples: boolean;
  hasInstallation: boolean;
  hasTroubleshooting: boolean;
  hasArchitecture: boolean;
  sectionCount: number;
} {
  if (!existsSync(filePath)) {
    return {
      hasQuickStart: false,
      hasExamples: false,
      hasInstallation: false,
      hasTroubleshooting: false,
      hasArchitecture: false,
      sectionCount: 0
    };
  }

  const content = readFileSync(filePath, 'utf-8').toLowerCase();
  const sections = content.match(/^##\s+/gm) || [];

  return {
    hasQuickStart: /quick\s*start|getting\s*started/.test(content),
    hasExamples: /examples?/.test(content),
    hasInstallation: /installation|setup/.test(content),
    hasTroubleshooting: /troubleshoot|issues|problems/.test(content),
    hasArchitecture: /architecture|design|structure/.test(content),
    sectionCount: sections.length
  };
}

// ============================================================================
// TEST SUITE 1: Token Count Validation (CRITICAL)
// ============================================================================

describe('Token Count Validation', () => {
  test('🔴 CRITICAL: Pack v2.0 should NOT increase documentation size', () => {
    // Original format
    const skillContent = readFileSync(ORIGINAL_FORMAT.skillMd, 'utf-8');
    const quickStartContent = readFileSync(ORIGINAL_FORMAT.quickStart, 'utf-8');
    const originalTokens = estimateTokens(skillContent + quickStartContent);

    // Pack v2.0 format - README only (what loads at session start)
    const packReadmeContent = readFileSync(PACK_V2_FORMAT.readme, 'utf-8');
    const packReadmeTokens = estimateTokens(packReadmeContent);

    console.log('\n=== TOKEN COUNT ANALYSIS ===');
    console.log(`Original format (SKILL.md + QUICK_START.md): ${originalTokens.toLocaleString()} tokens`);
    console.log(`Pack v2.0 (PACK_README.md only): ${packReadmeTokens.toLocaleString()} tokens`);

    const percentChange = ((packReadmeTokens / originalTokens - 1) * 100).toFixed(1);
    console.log(`Change: ${percentChange > 0 ? '+' : ''}${percentChange}%`);

    if (packReadmeTokens > originalTokens) {
      console.log(`\n🚨 FAIL: Pack v2.0 INCREASED size by ${(packReadmeTokens - originalTokens).toLocaleString()} tokens`);
      console.log(`Expected: Reduction (progressive disclosure)`);;
      console.log(`Actual: Expansion by ${percentChange}%`);
    }

    // Test FAILS if Pack v2.0 increased size
    expect(packReadmeTokens).toBeLessThan(originalTokens);
  });

  test('Progressive disclosure: Session load < Total documentation', () => {
    // Session load (what Claude sees at startup)
    const packReadmeContent = readFileSync(PACK_V2_FORMAT.readme, 'utf-8');
    const sessionTokens = estimateTokens(packReadmeContent);

    // Total documentation (all 3 files)
    const installContent = readFileSync(PACK_V2_FORMAT.install, 'utf-8');
    const verifyContent = readFileSync(PACK_V2_FORMAT.verify, 'utf-8');
    const totalTokens = estimateTokens(packReadmeContent + installContent + verifyContent);

    console.log('\n=== PROGRESSIVE DISCLOSURE ===');
    console.log(`Session load (README): ${sessionTokens.toLocaleString()} tokens`);
    console.log(`Total docs (README + INSTALL + VERIFY): ${totalTokens.toLocaleString()} tokens`);
    console.log(`Session load is ${((sessionTokens / totalTokens) * 100).toFixed(1)}% of total`);

    // Session load should be < 50% of total for effective progressive disclosure
    expect(sessionTokens).toBeLessThan(totalTokens * 0.5);
  });

  test('Individual file size comparison', () => {
    const skillLines = countContentLines(ORIGINAL_FORMAT.skillMd);
    const quickStartLines = countContentLines(ORIGINAL_FORMAT.quickStart);
    const readmeLines = countContentLines(PACK_V2_FORMAT.readme);
    const installLines = countContentLines(PACK_V2_FORMAT.install);
    const verifyLines = countContentLines(PACK_V2_FORMAT.verify);

    console.log('\n=== LINE COUNT COMPARISON ===');
    console.log('Original Format:');
    console.log(`  SKILL.md: ${skillLines} lines`);
    console.log(`  QUICK_START.md: ${quickStartLines} lines`);
    console.log(`  Total: ${skillLines + quickStartLines} lines`);

    console.log('\nPack v2.0 Format:');
    console.log(`  PACK_README.md: ${readmeLines} lines`);
    console.log(`  PACK_INSTALL.md: ${installLines} lines`);
    console.log(`  PACK_VERIFY.md: ${verifyLines} lines`);
    console.log(`  Total: ${readmeLines + installLines + verifyLines} lines`);

    // Record data for analysis
    expect(skillLines).toBeGreaterThan(0);
    expect(readmeLines).toBeGreaterThan(0);
  });
});

// ============================================================================
// TEST SUITE 2: Installation Complexity
// ============================================================================

describe('Installation Complexity', () => {
  test('Installation step count comparison', () => {
    const originalSteps = countInstallationSteps(ORIGINAL_FORMAT.quickStart);
    const packSteps = countInstallationSteps(PACK_V2_FORMAT.install);

    console.log('\n=== INSTALLATION COMPLEXITY ===');
    console.log(`Original (QUICK_START.md): ${originalSteps} steps`);
    console.log(`Pack v2.0 (PACK_INSTALL.md): ${packSteps} steps`);

    if (packSteps > originalSteps) {
      console.log(`\n⚠️  Pack v2.0 has ${packSteps - originalSteps} MORE installation steps`);
    } else if (packSteps < originalSteps) {
      console.log(`\n✅ Pack v2.0 has ${originalSteps - packSteps} FEWER installation steps`);
    } else {
      console.log(`\n→ Same number of installation steps`);
    }

    // Installation should not become more complex
    expect(packSteps).toBeLessThanOrEqual(originalSteps);
  });

  test('Required files to read for installation', () => {
    console.log('\n=== FILES TO READ ===');
    console.log('Original: Read QUICK_START.md (1 file)');
    console.log('Pack v2.0: Read PACK_README.md, then PACK_INSTALL.md (2 files)');

    // More files = more complexity
    const originalFileCount = 1;
    const packFileCount = 2;

    expect(packFileCount).toBeGreaterThan(originalFileCount);
  });
});

// ============================================================================
// TEST SUITE 3: Documentation Structure
// ============================================================================

describe('Documentation Structure Analysis', () => {
  test('Original format structure completeness', () => {
    const skillStructure = analyzeStructure(ORIGINAL_FORMAT.skillMd);
    const quickStartStructure = analyzeStructure(ORIGINAL_FORMAT.quickStart);

    console.log('\n=== ORIGINAL FORMAT STRUCTURE ===');
    console.log('SKILL.md:');
    console.log(`  Sections: ${skillStructure.sectionCount}`);
    console.log(`  Has examples: ${skillStructure.hasExamples}`);
    console.log(`  Has architecture: ${skillStructure.hasArchitecture}`);

    console.log('\nQUICK_START.md:');
    console.log(`  Sections: ${quickStartStructure.sectionCount}`);
    console.log(`  Has quick start: ${quickStartStructure.hasQuickStart}`);
    console.log(`  Has installation: ${quickStartStructure.hasInstallation}`);

    // Verify structure exists
    expect(skillStructure.sectionCount).toBeGreaterThan(0);
    expect(quickStartStructure.hasQuickStart || quickStartStructure.hasInstallation).toBe(true);
  });

  test('Pack v2.0 format structure completeness', () => {
    const readmeStructure = analyzeStructure(PACK_V2_FORMAT.readme);
    const installStructure = analyzeStructure(PACK_V2_FORMAT.install);
    const verifyStructure = analyzeStructure(PACK_V2_FORMAT.verify);

    console.log('\n=== PACK V2.0 FORMAT STRUCTURE ===');
    console.log('PACK_README.md:');
    console.log(`  Sections: ${readmeStructure.sectionCount}`);
    console.log(`  Has examples: ${readmeStructure.hasExamples}`);
    console.log(`  Has quick start: ${readmeStructure.hasQuickStart}`);
    console.log(`  Has architecture: ${readmeStructure.hasArchitecture}`);

    console.log('\nPACK_INSTALL.md:');
    console.log(`  Sections: ${installStructure.sectionCount}`);
    console.log(`  Has installation: ${installStructure.hasInstallation}`);

    console.log('\nPACK_VERIFY.md:');
    console.log(`  Sections: ${verifyStructure.sectionCount}`);
    console.log(`  Has troubleshooting: ${verifyStructure.hasTroubleshooting}`);

    // Verify structure exists
    expect(readmeStructure.sectionCount).toBeGreaterThan(0);
    expect(installStructure.sectionCount).toBeGreaterThan(0);
  });

  test('Structure comparison: Section count', () => {
    const originalTotal =
      analyzeStructure(ORIGINAL_FORMAT.skillMd).sectionCount +
      analyzeStructure(ORIGINAL_FORMAT.quickStart).sectionCount;

    const packTotal =
      analyzeStructure(PACK_V2_FORMAT.readme).sectionCount +
      analyzeStructure(PACK_V2_FORMAT.install).sectionCount +
      analyzeStructure(PACK_V2_FORMAT.verify).sectionCount;

    console.log('\n=== TOTAL SECTION COUNT ===');
    console.log(`Original: ${originalTotal} sections`);
    console.log(`Pack v2.0: ${packTotal} sections`);

    // More sections = potentially more complex to navigate
    const diff = packTotal - originalTotal;
    if (diff > 0) {
      console.log(`Pack v2.0 has ${diff} MORE sections`);
    } else if (diff < 0) {
      console.log(`Pack v2.0 has ${Math.abs(diff)} FEWER sections`);
    }

    // Record for analysis
    expect(originalTotal).toBeGreaterThan(0);
    expect(packTotal).toBeGreaterThan(0);
  });
});

// ============================================================================
// TEST SUITE 4: File Size Metrics
// ============================================================================

describe('File Size Metrics', () => {
  test('Actual file sizes on disk', () => {
    const getFileSize = (path: string): number => {
      return existsSync(path) ? statSync(path).size : 0;
    };

    const originalSize =
      getFileSize(ORIGINAL_FORMAT.skillMd) +
      getFileSize(ORIGINAL_FORMAT.quickStart);

    const packSize =
      getFileSize(PACK_V2_FORMAT.readme) +
      getFileSize(PACK_V2_FORMAT.install) +
      getFileSize(PACK_V2_FORMAT.verify);

    console.log('\n=== FILE SIZES (bytes) ===');
    console.log(`Original (SKILL + QUICK_START): ${originalSize.toLocaleString()} bytes`);
    console.log(`Pack v2.0 (README + INSTALL + VERIFY): ${packSize.toLocaleString()} bytes`);
    console.log(`Difference: ${(packSize - originalSize > 0 ? '+' : '')}${(packSize - originalSize).toLocaleString()} bytes`);
    console.log(`Percent change: ${((packSize / originalSize - 1) * 100).toFixed(1)}%`);

    // Record metrics
    expect(originalSize).toBeGreaterThan(0);
    expect(packSize).toBeGreaterThan(0);
  });
});
