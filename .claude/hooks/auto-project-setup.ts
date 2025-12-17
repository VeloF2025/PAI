#!/usr/bin/env bun

/**
 * auto-project-setup.ts
 *
 * Automatically detects and registers new projects on first Claude Code activation.
 * Creates session ID, memory file, and updates all configuration.
 *
 * Triggers: SessionStart
 *
 * What it does:
 * - Checks if current directory is already a registered project
 * - Detects if directory looks like a project (.git, package.json, etc.)
 * - Auto-registers new projects with unique session ID
 * - Creates memory file from template
 * - Updates project-sessions.ps1 with new commands
 * - Updates project-index.md
 *
 * Registry: ~/.claude/memories/projects/registry.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

interface ProjectEntry {
  path: string;
  sessionId: string;
  memoryFile: string;
  alias: string;
  registeredAt: string;
}

interface Registry {
  projects: Record<string, ProjectEntry>;
  version: string;
  lastUpdated: string;
}

function generateSessionId(name: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `${cleanName}-session-${randomSuffix}`;
}

function generateAlias(name: string): string {
  // Create short alias from project name
  const words = name.replace(/[_-]/g, ' ').split(' ');
  if (words.length === 1) {
    return words[0].toLowerCase().substring(0, 6);
  }
  // Use first letters of each word for multi-word names
  return words.map(w => w[0]).join('').toLowerCase();
}

function sanitizeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.md';
}

function isProjectDirectory(dir: string): boolean {
  // Check for common project indicators
  const indicators = [
    '.git',
    'package.json',
    'Cargo.toml',
    'pyproject.toml',
    'requirements.txt',
    'go.mod',
    'pom.xml',
    'build.gradle',
    '.claude',
    'CLAUDE.md',
    '.vscode',
    'tsconfig.json',
    'composer.json',
    'Gemfile',
    'setup.py',
    'CMakeLists.txt',
    'Makefile',
  ];

  return indicators.some(indicator => existsSync(join(dir, indicator)));
}

function loadRegistry(registryPath: string): Registry {
  if (existsSync(registryPath)) {
    try {
      return JSON.parse(readFileSync(registryPath, 'utf8'));
    } catch {
      console.error('Failed to parse registry, creating new one');
    }
  }
  return { projects: {}, version: '1.0', lastUpdated: new Date().toISOString().split('T')[0] };
}

function saveRegistry(registryPath: string, registry: Registry): void {
  registry.lastUpdated = new Date().toISOString().split('T')[0];
  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

function findProjectByPath(registry: Registry, currentPath: string): [string, ProjectEntry] | null {
  const normalizedCurrent = currentPath.replace(/\\/g, '/').toLowerCase();

  for (const [name, project] of Object.entries(registry.projects)) {
    const normalizedProject = project.path.replace(/\\/g, '/').toLowerCase();
    if (normalizedCurrent.includes(normalizedProject) || normalizedProject.includes(normalizedCurrent)) {
      return [name, project];
    }
  }
  return null;
}

function createMemoryFile(memoriesDir: string, memoryFile: string, projectName: string, projectPath: string, sessionId: string): void {
  const memoryPath = join(memoriesDir, 'projects', memoryFile);

  if (existsSync(memoryPath)) {
    return; // Don't overwrite existing memory
  }

  const template = `# ${projectName} - Project Memory

**Path**: \`${projectPath}\`
**Session ID**: \`${sessionId}\`
**Last Updated**: ${new Date().toISOString().split('T')[0]}

---

## Current State

_Auto-registered on first Claude Code activation._

---

## Recent Progress

- [ ] Initial setup

---

## Key Decisions

_None recorded yet._

---

## Tech Stack & Context

_To be populated during development._

---

## Important Notes

_Add project-specific notes here._

---

## Blockers & Questions

_None._
`;

  writeFileSync(memoryPath, template);
  console.error(`Created memory file: ${memoryPath}`);
}

function updateProjectSessionsPs1(paiDir: string, projectName: string, project: ProjectEntry): void {
  const ps1Path = join(paiDir, 'project-sessions.ps1');

  if (!existsSync(ps1Path)) {
    console.error('project-sessions.ps1 not found, skipping PowerShell update');
    return;
  }

  let content = readFileSync(ps1Path, 'utf8');

  // Check if alias already exists
  if (content.includes(`function ${project.alias} `)) {
    return;
  }

  // Add to ProjectSessions hashtable
  const sessionEntry = `    "${project.alias}" = @{
        Path      = "${project.path.replace(/\\/g, '\\\\')}"
        SessionId = "${project.sessionId}"
        Name      = "${projectName}"
    }`;

  // Find the closing brace of ProjectSessions and insert before it
  const hashTableEnd = content.indexOf('\n}', content.indexOf('$script:ProjectSessions'));
  if (hashTableEnd > 0) {
    content = content.slice(0, hashTableEnd) + '\n' + sessionEntry + content.slice(hashTableEnd);
  }

  // Add function aliases before the last function (claude-projects)
  const newFunctions = `
# ${projectName} (auto-registered)
function ${project.alias} { Start-ClaudeProject -ProjectKey "${project.alias}" }
function ${project.alias}-new { Start-ClaudeProject -ProjectKey "${project.alias}" -Fresh }
function ${project.alias}-resume { Start-ClaudeProject -ProjectKey "${project.alias}" -Continue }
`;

  // Insert before claude-projects function
  const claudeProjectsIdx = content.indexOf('# Help command');
  if (claudeProjectsIdx > 0) {
    content = content.slice(0, claudeProjectsIdx) + newFunctions + '\n' + content.slice(claudeProjectsIdx);
  }

  writeFileSync(ps1Path, content);
  console.error(`Updated project-sessions.ps1 with ${project.alias} commands`);
}

function updateProjectIndex(memoriesDir: string, projectName: string, project: ProjectEntry): void {
  const indexPath = join(memoriesDir, 'project-index.md');

  if (!existsSync(indexPath)) {
    return;
  }

  let content = readFileSync(indexPath, 'utf8');

  // Check if project already in index
  if (content.includes(`### ${projectName}`)) {
    return;
  }

  // Find Quick Reference table and add entry
  const tableEnd = content.indexOf('\n\n---\n\n## Completed Projects');
  if (tableEnd > 0) {
    const newEntry = `| ${projectName} | \`${project.alias}\` | ${project.sessionId} |\n`;
    const tableEndMarker = '\n\n---';
    const insertPoint = content.lastIndexOf(tableEndMarker, tableEnd);
    if (insertPoint > 0) {
      content = content.slice(0, insertPoint) + '\n' + newEntry.trim() + content.slice(insertPoint);
    }
  }

  // Add full project section before Quick Reference
  const quickRefIdx = content.indexOf('## Quick Reference');
  if (quickRefIdx > 0) {
    const projectSection = `
### ${projectName}
- **Path**: \`${project.path}\`
- **Session ID**: \`${project.sessionId}\`
- **Command**: \`${project.alias}\` / \`${project.alias}-resume\` / \`${project.alias}-new\`
- **Status**: Active
- **Memory File**: \`~/.claude/memories/projects/${project.memoryFile}\`
- **Last Worked**: ${new Date().toISOString().split('T')[0]}
- **Key Info**: _Auto-registered_

---

`;
    content = content.slice(0, quickRefIdx) + projectSection + content.slice(quickRefIdx);
  }

  writeFileSync(indexPath, content);
  console.error(`Updated project-index.md with ${projectName}`);
}

async function main() {
  try {
    // Skip for subagents
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      process.exit(0);
    }

    const paiDir = process.env.PAI_DIR || join(homedir(), '.claude');
    const memoriesDir = join(paiDir, 'memories');
    const registryPath = join(memoriesDir, 'projects', 'registry.json');
    const currentDir = process.cwd();

    // Ensure directories exist
    mkdirSync(join(memoriesDir, 'projects'), { recursive: true });

    // Load registry
    const registry = loadRegistry(registryPath);

    // Check if current directory is already registered
    const existing = findProjectByPath(registry, currentDir);
    if (existing) {
      console.error(`Project already registered: ${existing[0]}`);
      process.exit(0);
    }

    // Check if this looks like a project
    if (!isProjectDirectory(currentDir)) {
      console.error('Not a project directory, skipping auto-registration');
      process.exit(0);
    }

    // Auto-register new project
    const projectName = basename(currentDir);
    const sessionId = generateSessionId(projectName);
    const alias = generateAlias(projectName);
    const memoryFile = sanitizeFileName(projectName);

    const newProject: ProjectEntry = {
      path: currentDir,
      sessionId,
      memoryFile,
      alias,
      registeredAt: new Date().toISOString().split('T')[0],
    };

    // Update registry
    registry.projects[projectName] = newProject;
    saveRegistry(registryPath, registry);
    console.error(`Registered new project: ${projectName} (alias: ${alias})`);

    // Create memory file
    createMemoryFile(memoriesDir, memoryFile, projectName, currentDir, sessionId);

    // Update project-sessions.ps1
    updateProjectSessionsPs1(paiDir, projectName, newProject);

    // Update project-index.md
    updateProjectIndex(memoriesDir, projectName, newProject);

    // Output notification for Claude
    console.log(`<system-reminder>
NEW PROJECT AUTO-REGISTERED

Project "${projectName}" has been automatically registered:
- Session ID: ${sessionId}
- Alias: ${alias}
- Memory File: ${memoryFile}

PowerShell commands available after terminal restart:
- \`${alias}\` - Start/resume project session
- \`${alias}-resume\` - Continue last conversation
- \`${alias}-new\` - Start fresh session

Project memory will be loaded and saved automatically.
</system-reminder>`);

    process.exit(0);
  } catch (error) {
    console.error('Auto-project-setup error:', error);
    process.exit(1);
  }
}

main();
