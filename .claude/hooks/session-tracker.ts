#!/usr/bin/env bun

/**
 * session-tracker.ts
 *
 * Tracks active Claude Code sessions for parallel work visibility.
 * Registers sessions on start, removes on end.
 *
 * Usage:
 *   bun session-tracker.ts start [label]   # Register session
 *   bun session-tracker.ts stop            # Unregister session
 *   bun session-tracker.ts status          # Show active sessions
 *   bun session-tracker.ts cleanup         # Remove stale sessions
 *
 * Integrates with: ~/.claude/memories/projects/active-sessions.json
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

interface SessionEntry {
  project: string;
  projectPath: string;
  sessionId: string;
  label: string;
  startedAt: string;
  pid: number;
  terminal: string;
}

interface ActiveSessions {
  sessions: Record<string, SessionEntry>;
  version: string;
}

function getSessionsPath(): string {
  const paiDir = process.env.PAI_DIR || join(homedir(), '.claude');
  return join(paiDir, 'memories', 'projects', 'active-sessions.json');
}

function loadSessions(): ActiveSessions {
  const path = getSessionsPath();
  if (existsSync(path)) {
    try {
      return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
      // Corrupted, start fresh
    }
  }
  return { sessions: {}, version: '1.0' };
}

function saveSessions(sessions: ActiveSessions): void {
  writeFileSync(getSessionsPath(), JSON.stringify(sessions, null, 2));
}

function generateTerminalId(): string {
  // Use PID and timestamp for unique terminal ID
  return `term-${process.pid}-${Date.now().toString(36)}`;
}

function getProjectFromPath(currentPath: string): { name: string; sessionId: string } | null {
  const paiDir = process.env.PAI_DIR || join(homedir(), '.claude');
  const registryPath = join(paiDir, 'memories', 'projects', 'registry.json');

  if (!existsSync(registryPath)) return null;

  try {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
    const normalizedCurrent = currentPath.toLowerCase().split('\\').join('/');

    for (const [name, project] of Object.entries(registry.projects) as [string, any][]) {
      const normalizedProject = project.path.toLowerCase().split('\\').join('/');
      if (normalizedCurrent.includes(normalizedProject) || normalizedProject.includes(normalizedCurrent)) {
        return { name, sessionId: project.sessionId };
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

function registerSession(label?: string): void {
  const currentDir = process.cwd();
  const project = getProjectFromPath(currentDir);

  if (!project) {
    console.error('Not in a registered project directory');
    return;
  }

  const sessions = loadSessions();
  const terminalId = generateTerminalId();
  // Use environment variable if set, otherwise fall back to argument or 'main'
  const sessionLabel = process.env.CLAUDE_SESSION_LABEL || label || 'main';

  // Check for existing main session for this project
  const existingMain = Object.entries(sessions.sessions).find(
    ([_, s]) => s.project === project.name && s.label === 'main'
  );

  const effectiveLabel = sessionLabel === 'main' && existingMain
    ? `parallel-${Object.keys(sessions.sessions).length + 1}`
    : sessionLabel;

  const entry: SessionEntry = {
    project: project.name,
    projectPath: currentDir,
    sessionId: project.sessionId,
    label: effectiveLabel,
    startedAt: new Date().toISOString(),
    pid: process.ppid || process.pid,
    terminal: terminalId,
  };

  sessions.sessions[terminalId] = entry;
  saveSessions(sessions);

  console.error(`Session registered: ${project.name} [${effectiveLabel}]`);

  // Output for Claude context
  console.log(`<system-reminder>
ACTIVE SESSION REGISTERED

Project: ${project.name}
Label: ${effectiveLabel}
Terminal: ${terminalId}
Started: ${entry.startedAt}

Other active sessions for this project:
${Object.values(sessions.sessions)
  .filter(s => s.project === project.name && s.terminal !== terminalId)
  .map(s => `  - [${s.label}] started ${s.startedAt}`)
  .join('\n') || '  (none)'}
</system-reminder>`);
}

function unregisterSession(): void {
  const sessions = loadSessions();
  const currentPid = process.ppid || process.pid;

  // Find and remove sessions with matching PID
  let removed = 0;
  for (const [terminalId, session] of Object.entries(sessions.sessions)) {
    if (session.pid === currentPid) {
      delete sessions.sessions[terminalId];
      removed++;
      console.error(`Session unregistered: ${session.project} [${session.label}]`);
    }
  }

  if (removed > 0) {
    saveSessions(sessions);
  }
}

function showStatus(): void {
  const sessions = loadSessions();
  const byProject: Record<string, SessionEntry[]> = {};

  for (const session of Object.values(sessions.sessions)) {
    if (!byProject[session.project]) {
      byProject[session.project] = [];
    }
    byProject[session.project].push(session);
  }

  console.log('\n=== Active Claude Sessions ===\n');

  if (Object.keys(byProject).length === 0) {
    console.log('No active sessions.\n');
    return;
  }

  for (const [project, projectSessions] of Object.entries(byProject)) {
    console.log(`${project}:`);
    for (const s of projectSessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
      const duration = getSessionDuration(s.startedAt);
      console.log(`  [${s.label}] - ${duration} (PID: ${s.pid})`);
    }
    console.log('');
  }
}

function getSessionDuration(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const mins = Math.floor((now - start) / 60000);

  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function cleanupStaleSessions(): void {
  const sessions = loadSessions();
  const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  let cleaned = 0;

  for (const [terminalId, session] of Object.entries(sessions.sessions)) {
    const sessionAge = now - new Date(session.startedAt).getTime();
    if (sessionAge > staleThreshold) {
      delete sessions.sessions[terminalId];
      cleaned++;
      console.error(`Cleaned stale session: ${session.project} [${session.label}]`);
    }
  }

  if (cleaned > 0) {
    saveSessions(sessions);
    console.log(`Cleaned ${cleaned} stale session(s).`);
  } else {
    console.log('No stale sessions to clean.');
  }
}

// Main
const action = process.argv[2] || 'start';
const label = process.argv[3];

switch (action) {
  case 'start':
    registerSession(label);
    break;
  case 'stop':
    unregisterSession();
    break;
  case 'status':
    showStatus();
    break;
  case 'cleanup':
    cleanupStaleSessions();
    break;
  default:
    console.error(`Unknown action: ${action}`);
    console.error('Usage: session-tracker.ts [start|stop|status|cleanup] [label]');
    process.exit(1);
}
