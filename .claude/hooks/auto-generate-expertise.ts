#!/usr/bin/env bun

/**
 * Auto-Generate Expertise Hook
 *
 * Automatically creates expertise.yaml for projects that don't have one.
 * Scans the project to detect stack, framework, directories, and patterns.
 *
 * Hook Type: SessionStart (runs before expert-load.ts)
 *
 * What it does:
 * 1. Check if .claude/expertise.yaml already exists
 * 2. If not, scan project structure:
 *    - Detect language/framework from package.json or pyproject.toml
 *    - Find common directories (src/, api/, components/, etc.)
 *    - Detect ORM/database layer
 *    - Identify build/test commands
 * 3. Generate minimal expertise.yaml with discovered info
 * 4. Save to .claude/expertise.yaml
 *
 * Key principle: "Every project gets a mental model automatically"
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { stringify } from 'yaml';

const HOME = process.env.USERPROFILE || process.env.HOME || '';

interface SessionContext {
  working_directory: string;
}

interface ProjectInfo {
  name: string;
  language: string;
  runtime?: string;
  framework?: string;
  orm?: string;
  directories: Record<string, string>;
  commands: Record<string, string>;
  dependencies: string[];
}

/**
 * Check if expertise.yaml exists in project
 */
function hasExpertise(projectDir: string): boolean {
  const expertisePath = join(projectDir, '.claude', 'expertise.yaml');
  return existsSync(expertisePath);
}

/**
 * Scan directory tree to find common project directories
 */
function scanDirectories(projectDir: string): Record<string, string> {
  const locations: Record<string, string> = {};
  const maxDepth = 3;

  function scan(dir: string, depth: number) {
    if (depth > maxDepth) return;

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        // Skip node_modules, .git, dist, build, etc.
        if (['.git', 'node_modules', 'dist', 'build', '.next', '__pycache__', 'venv', '.venv'].includes(item)) {
          continue;
        }

        const fullPath = join(dir, item);
        const relativePath = fullPath.replace(projectDir, '').replace(/^[\\\/]/, '').replace(/\\/g, '/');

        try {
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            const itemLower = item.toLowerCase();

            // Match common directory patterns
            if (itemLower === 'src' && !locations.src) locations.src = relativePath;
            if (itemLower === 'api' && !locations.api) locations.api = relativePath;
            if (itemLower === 'components' && !locations.components) locations.components = relativePath;
            if (itemLower === 'lib' && !locations.lib) locations.lib = relativePath;
            if (itemLower === 'utils' && !locations.utils) locations.utils = relativePath;
            if (itemLower === 'hooks' && !locations.hooks) locations.hooks = relativePath;
            if (itemLower === 'services' && !locations.services) locations.services = relativePath;
            if ((itemLower === 'tests' || itemLower === '__tests__') && !locations.tests) locations.tests = relativePath;
            if ((itemLower === 'docs' || itemLower === 'documentation') && !locations.docs) locations.docs = relativePath;
            if ((itemLower === 'config' || itemLower === 'configuration') && !locations.config) locations.config = relativePath;
            if ((itemLower === 'db' || itemLower === 'database') && !locations.database) locations.database = relativePath;
            if (itemLower === 'scripts' && !locations.scripts) locations.scripts = relativePath;
            if (itemLower === 'public' && !locations.public) locations.public = relativePath;
            if (itemLower === 'assets' && !locations.assets) locations.assets = relativePath;
            if (itemLower === 'models' && !locations.models) locations.models = relativePath;
            if (itemLower === 'controllers' && !locations.controllers) locations.controllers = relativePath;
            if (itemLower === 'routes' && !locations.routes) locations.routes = relativePath;
            if (itemLower === 'middleware' && !locations.middleware) locations.middleware = relativePath;
            if (itemLower === '.claude' && !locations.project_claude) locations.project_claude = relativePath;

            // Recurse into subdirectories
            scan(fullPath, depth + 1);
          }
        } catch {
          // Skip files/dirs we can't access
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  scan(projectDir, 0);
  return locations;
}

/**
 * Detect project info from package.json (Node.js/TypeScript)
 */
function detectNodeProject(projectDir: string): ProjectInfo | null {
  const packageJsonPath = join(projectDir, 'package.json');
  if (!existsSync(packageJsonPath)) return null;

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const info: ProjectInfo = {
      name: packageJson.name || basename(projectDir),
      language: 'typescript',
      runtime: 'node',
      directories: {},
      commands: {},
      dependencies: Object.keys(deps)
    };

    // Detect runtime
    if (deps['bun'] || packageJson.scripts?.build?.includes('bun')) {
      info.runtime = 'bun';
    }

    // Detect framework
    if (deps['next']) info.framework = 'next.js';
    else if (deps['react']) info.framework = 'react';
    else if (deps['vue']) info.framework = 'vue';
    else if (deps['express']) info.framework = 'express';
    else if (deps['fastify']) info.framework = 'fastify';
    else if (deps['@anthropic-ai/sdk']) info.framework = 'claude-code-skills';

    // Detect ORM
    if (deps['drizzle-orm']) info.orm = 'drizzle';
    else if (deps['prisma']) info.orm = 'prisma';
    else if (deps['typeorm']) info.orm = 'typeorm';
    else if (deps['sequelize']) info.orm = 'sequelize';

    // Extract commands from scripts
    if (packageJson.scripts) {
      const scripts = packageJson.scripts;
      if (scripts.dev) info.commands.dev = `npm run dev`;
      if (scripts.build) info.commands.build = `npm run build`;
      if (scripts.test) info.commands.test = `npm test`;
      if (scripts.lint) info.commands.lint = `npm run lint`;
      if (scripts['type-check']) info.commands.type_check = `npm run type-check`;
      if (scripts['db:generate']) info.commands.db_generate = `npm run db:generate`;
      if (scripts['db:migrate']) info.commands.db_migrate = `npm run db:migrate`;
      if (scripts['db:push']) info.commands.db_push = `npm run db:push`;
    }

    return info;
  } catch {
    return null;
  }
}

/**
 * Detect project info from pyproject.toml or requirements.txt (Python)
 */
function detectPythonProject(projectDir: string): ProjectInfo | null {
  const pyprojectPath = join(projectDir, 'pyproject.toml');
  const requirementsPath = join(projectDir, 'requirements.txt');

  if (!existsSync(pyprojectPath) && !existsSync(requirementsPath)) return null;

  const info: ProjectInfo = {
    name: basename(projectDir),
    language: 'python',
    runtime: 'python',
    directories: {},
    commands: {},
    dependencies: []
  };

  // Parse dependencies from requirements.txt
  if (existsSync(requirementsPath)) {
    try {
      const requirements = readFileSync(requirementsPath, 'utf-8');
      info.dependencies = requirements.split('\n')
        .map(line => line.trim().split(/[=<>]/)[0])
        .filter(dep => dep.length > 0);
    } catch {
      // Ignore parse errors
    }
  }

  // Detect framework
  const depsLower = info.dependencies.map(d => d.toLowerCase());
  if (depsLower.includes('fastapi')) info.framework = 'fastapi';
  else if (depsLower.includes('django')) info.framework = 'django';
  else if (depsLower.includes('flask')) info.framework = 'flask';

  // Detect ORM
  if (depsLower.includes('sqlalchemy')) info.orm = 'sqlalchemy';
  else if (depsLower.includes('django')) info.orm = 'django-orm';

  // Common Python commands
  info.commands.run = 'python main.py';
  info.commands.test = 'pytest';
  info.commands.lint = 'pylint .';

  return info;
}

/**
 * Infer domain from project name and structure
 */
function inferDomain(projectInfo: ProjectInfo, directories: Record<string, string>): string {
  const nameLower = projectInfo.name.toLowerCase();

  // Check project name for hints
  if (nameLower.includes('api')) return 'api-service';
  if (nameLower.includes('bot')) return 'discord-bot';
  if (nameLower.includes('cli')) return 'cli-tool';
  if (nameLower.includes('infrastructure') || nameLower.includes('pai')) return 'ai-infrastructure';
  if (nameLower.includes('agent')) return 'ai-agent';
  if (nameLower.includes('web') || nameLower.includes('app')) return 'web-application';

  // Check directories for hints
  if (directories.api && directories.components) return 'full-stack-web';
  if (directories.api && !directories.components) return 'backend-api';
  if (directories.components && !directories.api) return 'frontend-app';

  // Check framework
  if (projectInfo.framework === 'next.js') return 'nextjs-application';
  if (projectInfo.framework === 'react') return 'react-application';
  if (projectInfo.framework === 'express' || projectInfo.framework === 'fastapi') return 'api-service';

  return 'software-project';
}

/**
 * Generate expertise YAML content
 */
function generateExpertise(projectInfo: ProjectInfo, directories: Record<string, string>): string {
  const domain = inferDomain(projectInfo, directories);
  const timestamp = new Date().toISOString();

  const expertise = {
    expertise: {
      project: projectInfo.name,
      domain: domain,
      version: 1,
      last_updated: timestamp,
      stack: {
        language: projectInfo.language,
        ...(projectInfo.runtime && { runtime: projectInfo.runtime }),
        ...(projectInfo.framework && { framework: projectInfo.framework }),
        ...(projectInfo.orm && { orm: projectInfo.orm })
      },
      key_locations: directories,
      patterns: [
        {
          name: 'Auto-generated expertise',
          when: 'starting work on this project',
          notes: 'This expertise file was auto-generated. It will improve as you work on the project via expert-self-improve hook.'
        }
      ],
      anti_patterns: [
        {
          name: 'Working without context',
          why_bad: 'Wastes time searching for files and patterns',
          what_to_do: 'Read this expertise file first, validate against code, then act'
        }
      ],
      commands: projectInfo.commands,
      update_history: [
        {
          version: 1,
          date: timestamp,
          changes: 'Auto-generated initial expertise file'
        }
      ]
    }
  };

  const yamlContent = stringify(expertise, {
    lineWidth: 120,
    defaultStringType: 'PLAIN',
    defaultKeyType: 'PLAIN'
  });

  const header = `# Project Expertise - Auto-generated by auto-generate-expertise hook
# Last updated: ${timestamp}
# Version: 1
#
# This file serves as the agent's "mental model" for this project.
# It will be automatically updated as you work via the expert-self-improve hook.
#
# Key principle: "Read First, Validate, Then Act"
#

`;

  return header + yamlContent;
}

/**
 * Save expertise.yaml to project
 */
function saveExpertise(projectDir: string, content: string): void {
  const claudeDir = join(projectDir, '.claude');
  const expertisePath = join(claudeDir, 'expertise.yaml');

  // Create .claude directory if it doesn't exist
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  writeFileSync(expertisePath, content, 'utf-8');
}

/**
 * Main function
 */
async function main() {
  let context: SessionContext;

  try {
    // Check if stdin has data (with timeout to prevent hanging)
    const stdin = Bun.stdin;
    let input = '';

    // Only try to read if stdin is not a TTY (has piped input)
    if (!process.stdin.isTTY) {
      const reader = stdin.stream().getReader();
      const { value, done } = await Promise.race([
        reader.read(),
        new Promise<{ value: undefined; done: true }>((resolve) =>
          setTimeout(() => resolve({ value: undefined, done: true }), 100)
        ),
      ]);
      reader.releaseLock();

      if (value) {
        input = new TextDecoder().decode(value);
      }
    }

    context = input ? JSON.parse(input) : { working_directory: process.cwd() };
  } catch {
    context = { working_directory: process.cwd() };
  }

  const workDir = context.working_directory || process.cwd();

  // Check if expertise.yaml already exists
  if (hasExpertise(workDir)) {
    console.error('[auto-generate-expertise] Expertise file already exists - skipping');
    return;
  }

  // Detect project type and info
  let projectInfo = detectNodeProject(workDir);
  if (!projectInfo) {
    projectInfo = detectPythonProject(workDir);
  }

  if (!projectInfo) {
    console.error('[auto-generate-expertise] Could not detect project type (no package.json or pyproject.toml) - skipping');
    return;
  }

  // Scan for directories
  const directories = scanDirectories(workDir);

  // Generate expertise
  const expertiseContent = generateExpertise(projectInfo, directories);

  // Save expertise
  saveExpertise(workDir, expertiseContent);

  console.error('');
  console.error('✨ AUTO-GENERATED EXPERTISE');
  console.error('─'.repeat(50));
  console.error(`Project: ${projectInfo.name}`);
  console.error(`Language: ${projectInfo.language}`);
  console.error(`Framework: ${projectInfo.framework || 'none detected'}`);
  console.error(`Directories found: ${Object.keys(directories).length}`);
  console.error('');
  console.error(`📁 Saved to: .claude/expertise.yaml`);
  console.error('');
  console.error('This expertise will automatically improve as you work on the project.');
  console.error('The expert-self-improve hook will learn new patterns and locations.');
  console.error('─'.repeat(50));
  console.error('');
}

// Run
main().catch(err => {
  console.error(`[auto-generate-expertise] Error: ${err.message}`);
});
