#!/usr/bin/env bun

/**
 * Auto-Generate Project Knowledge Hook
 *
 * Runs on SessionStart to automatically extract codebase knowledge and generate
 * project-specific coding agent skills.
 *
 * Triggered by: SessionStart hook
 * Runs when: .claude/skills/project-codebase/ doesn't exist
 * Generates:
 *   - .claude/skills/project-codebase/ (tech stack, patterns, schemas, APIs)
 *   - .claude/skills/coding-specialists/ (specialized coding agents)
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { detectProjectType } from '../scripts/extractors/base-extractor.ts';
import { TypeScriptExtractor } from '../scripts/extractors/typescript-extractor.ts';
import { PythonExtractor } from '../scripts/extractors/python-extractor.ts';
import { generateCodebaseSkills } from '../scripts/generators/skill-generator.ts';
import { generateCodingAgentSkills } from '../scripts/generators/agent-generator.ts';

async function main() {
  try {
    const projectRoot = process.cwd();
    const knowledgeDir = join(projectRoot, '.claude', 'skills', 'project-codebase');

    // Skip if already generated
    if (existsSync(knowledgeDir)) {
      // Silent skip - knowledge already exists
      // User can check status with: bun ~/.claude/scripts/check-pai-status.ts
      process.exit(0);
    }

    console.error('[pai-knowledge] 🔍 Analyzing codebase for automatic knowledge extraction...');

    // Detect project type
    const projectType = detectProjectType(projectRoot);

    if (!projectType || projectType.language === 'unknown') {
      console.error('[pai-knowledge] ℹ️  No supported project type detected (looking for package.json, pyproject.toml, etc.)');
      process.exit(0);
    }

    console.error(`[pai-knowledge] 📦 Detected ${projectType.language} project (${projectType.framework || 'no framework'})`);

    // Select appropriate extractor
    let knowledge;
    if (projectType.language === 'typescript' || projectType.language === 'javascript') {
      console.error('[pai-knowledge] 🔧 Using TypeScript extractor with ts-morph...');
      const extractor = new TypeScriptExtractor(projectRoot, projectType);
      knowledge = await extractor.extract();
    } else if (projectType.language === 'python') {
      console.error('[pai-knowledge] 🐍 Using Python extractor...');
      const extractor = new PythonExtractor(projectRoot, projectType);
      knowledge = await extractor.extract();
    } else {
      console.error(`[pai-knowledge] ⚠️  Language ${projectType.language} not yet supported for extraction`);
      process.exit(0);
    }

    // Generate codebase knowledge skills
    console.error('[pai-knowledge] 📝 Generating codebase knowledge skills...');
    await generateCodebaseSkills(knowledgeDir, knowledge);

    // Generate coding agent skills
    console.error('[pai-knowledge] 🤖 Generating specialized coding agents...');
    await generateCodingAgentSkills(projectRoot, knowledge);

    console.error('\n╔═══════════════════════════════════════════════════════════╗');
    console.error('║  ✅ PAI PROJECT KNOWLEDGE GENERATED                       ║');
    console.error('╠═══════════════════════════════════════════════════════════╣');
    console.error(`║  📦 Tech Stack: ${knowledge.techStack.language}${' '.repeat(42 - knowledge.techStack.language.length)}║`);
    console.error(`║  🔧 Framework: ${knowledge.techStack.frameworks[0]?.name || 'None'}${' '.repeat(43 - (knowledge.techStack.frameworks[0]?.name || 'None').length)}║`);
    console.error(`║  🗂️  Services: ${knowledge.codePatterns.services?.length || 0} detected${' '.repeat(42 - String(knowledge.codePatterns.services?.length || 0).length)}║`);
    console.error(`║  🎨 Components: ${knowledge.codePatterns.components?.length || 0} detected${' '.repeat(39 - String(knowledge.codePatterns.components?.length || 0).length)}║`);
    if (knowledge.databaseSchema) {
      console.error(`║  🗄️  Database: ${knowledge.databaseSchema.orm}${' '.repeat(44 - (knowledge.databaseSchema.orm?.length || 0))}║`);
      console.error(`║  📊 Tables: ${knowledge.databaseSchema.tables?.length || 0} detected${' '.repeat(45 - String(knowledge.databaseSchema.tables?.length || 0).length)}║`);
      console.error(`║  🔢 Enums: ${knowledge.databaseSchema.enums?.length || 0} defined${' '.repeat(46 - String(knowledge.databaseSchema.enums?.length || 0).length)}║`);
    }
    if (knowledge.apiRoutes) {
      console.error(`║  🌐 API Routes: ${knowledge.apiRoutes.length} endpoints${' '.repeat(39 - String(knowledge.apiRoutes.length).length)}║`);
    }
    console.error('╠═══════════════════════════════════════════════════════════╣');
    console.error('║  📁 Generated Skills:                                     ║');
    console.error('║    • .claude/skills/project-codebase/tech-stack.md       ║');
    console.error('║    • .claude/skills/project-codebase/code-patterns.md    ║');
    if (knowledge.databaseSchema) {
      console.error('║    • .claude/skills/project-codebase/database-schema.md  ║');
    }
    if (knowledge.apiRoutes && knowledge.apiRoutes.length > 0) {
      console.error('║    • .claude/skills/project-codebase/api-reference.md    ║');
    }
    console.error('║    • .claude/skills/coding-specialists/SKILL.md (router) ║');
    console.error('║    • .claude/skills/coding-specialists/agents/*.md       ║');
    console.error('╚═══════════════════════════════════════════════════════════╝\n');

    // Save extraction metadata for change detection
    const metadataPath = join(knowledgeDir, '.extraction-metadata.json');
    const metadata = {
      lastExtraction: Date.now(),
      timestamp: new Date().toISOString(),
      servicesCount: knowledge.codePatterns.services?.length || 0,
      componentsCount: knowledge.codePatterns.components?.length || 0,
      tablesCount: knowledge.databaseSchema?.tables?.length || 0,
      apiRoutesCount: knowledge.apiRoutes?.length || 0,
    };
    require('fs').writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // IMPORTANT: Output to stdout so user sees completion notification
    console.log(`\n✅ PAI: Project knowledge generated (${knowledge.codePatterns.services?.length || 0} services, ${knowledge.codePatterns.components?.length || 0} components)`);

    process.exit(0);
  } catch (error) {
    console.error('[pai-knowledge] ❌ Error during knowledge extraction:');
    console.error(error);
    // Also notify user via stdout on error
    console.log('⚠️ PAI: Knowledge extraction encountered an error (check system-reminders for details)');
    // Don't block session start on errors
    process.exit(0);
  }
}

main();
