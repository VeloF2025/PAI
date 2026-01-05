#!/usr/bin/env bun
/**
 * App Spec Synthesizer
 * ====================
 *
 * Synthesizes PRD, PRP, and ADR documents into a consolidated app_spec.txt
 * file that the Python autonomous-coding agent can read.
 *
 * Format: Structured XML specification matching the format expected by
 * autonomous_agent_demo.py's prompts.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface SpecPaths {
  prdPath: string;
  prpPath: string;
  adrPath: string;
  outputPath: string;
}

export interface ProjectMetadata {
  projectName: string;
  overview: string;
  techStack: string;
  features: string;
  implementation: string;
  architecture: string;
}

/**
 * Synthesize PRD, PRP, and ADR into app_spec.txt
 */
export async function synthesizeAppSpec(paths: SpecPaths): Promise<string> {
  console.log(`📄 [Synthesizer] Creating app_spec.txt from PAI documents`);
  console.log(`   PRD: ${paths.prdPath}`);
  console.log(`   PRP: ${paths.prpPath}`);
  console.log(`   ADR: ${paths.adrPath}`);
  console.log(`   Output: ${paths.outputPath}`);

  // Read PAI documents
  const prd = await fs.readFile(paths.prdPath, 'utf-8');
  const prp = await fs.readFile(paths.prpPath, 'utf-8');
  const adr = await fs.readFile(paths.adrPath, 'utf-8');

  // Extract structured metadata
  const metadata = extractMetadata(prd, prp, adr);

  // Generate app_spec.txt in XML format
  const appSpec = generateAppSpecXML(metadata, prd, prp, adr);

  // Write to output file
  await fs.writeFile(paths.outputPath, appSpec, 'utf-8');

  console.log(`✅ [Synthesizer] app_spec.txt created (${appSpec.length} bytes)`);

  return paths.outputPath;
}

/**
 * Extract structured metadata from PAI documents
 */
function extractMetadata(prd: string, prp: string, adr: string): ProjectMetadata {
  // Extract project name (first heading in PRD)
  const projectNameMatch = prd.match(/^#\s+(.+)$/m);
  const projectName = projectNameMatch ? projectNameMatch[1] : 'Untitled Project';

  // Extract overview (first paragraph after PRD heading)
  const overviewMatch = prd.match(/^#\s+.+?\n\n(.+?)(?:\n\n|$)/s);
  const overview = overviewMatch
    ? overviewMatch[1].replace(/\n/g, ' ').trim()
    : 'No overview provided.';

  // Extract tech stack from PRP
  const techStackSection = extractSection(prp, 'Technology Stack', 'Tech Stack', 'Technologies');
  const techStack = techStackSection || 'No technology stack specified.';

  // Extract features from PRD
  const featuresSection = extractSection(prd, 'Features', 'Core Features', 'Functionality');
  const features = featuresSection || 'No features specified.';

  // Extract implementation details from PRP
  const implementationSection = extractSection(
    prp,
    'Implementation',
    'Implementation Plan',
    'Development Plan'
  );
  const implementation = implementationSection || 'No implementation details provided.';

  // Architecture is the full ADR
  const architecture = adr;

  return {
    projectName,
    overview,
    techStack,
    features,
    implementation,
    architecture,
  };
}

/**
 * Extract a section from markdown by header name
 */
function extractSection(markdown: string, ...headers: string[]): string | null {
  for (const header of headers) {
    // Match ## Header or # Header
    const regex = new RegExp(`^#{1,3}\\s+${header}\\s*$`, 'im');
    const match = markdown.match(regex);

    if (match) {
      const startIndex = match.index! + match[0].length;
      // Find next header or end of document
      const nextHeaderRegex = /^#{1,3}\s+/m;
      const nextMatch = markdown.slice(startIndex).match(nextHeaderRegex);
      const endIndex = nextMatch ? startIndex + nextMatch.index! : markdown.length;

      return markdown.slice(startIndex, endIndex).trim();
    }
  }

  return null;
}

/**
 * Generate app_spec.txt in XML format
 */
function generateAppSpecXML(
  metadata: ProjectMetadata,
  prd: string,
  prp: string,
  adr: string
): string {
  return `<project_specification>
  <project_name>${escapeXML(metadata.projectName)}</project_name>

  <overview>
${indentText(escapeXML(metadata.overview), 4)}
  </overview>

  <technology_stack>
${indentText(formatAsXML(metadata.techStack), 4)}
  </technology_stack>

  <core_features>
${indentText(formatAsXML(metadata.features), 4)}
  </core_features>

  <implementation_details>
${indentText(formatAsXML(metadata.implementation), 4)}
  </implementation_details>

  <architecture_decisions>
${indentText(escapeXML(metadata.architecture), 4)}
  </architecture_decisions>

  <full_documents>
    <prd>
${indentText(escapeXML(prd), 6)}
    </prd>

    <prp>
${indentText(escapeXML(prp), 6)}
    </prp>

    <adr>
${indentText(escapeXML(adr), 6)}
    </adr>
  </full_documents>
</project_specification>
`;
}

/**
 * Format markdown as structured XML
 */
function formatAsXML(markdown: string): string {
  // Convert markdown lists to XML items
  const lines = markdown.split('\n');
  const xmlLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Bullet list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2).trim();
      xmlLines.push(`<item>${escapeXML(content)}</item>`);
    }
    // Numbered list items
    else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s+/, '').trim();
      xmlLines.push(`<item>${escapeXML(content)}</item>`);
    }
    // Regular text
    else {
      xmlLines.push(escapeXML(trimmed));
    }
  }

  return xmlLines.join('\n');
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Indent text by specified spaces
 */
function indentText(text: string, spaces: number): string {
  const indent = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line.trim() ? indent + line : ''))
    .join('\n');
}

/**
 * Validate that app_spec.txt was created successfully
 */
export async function validateAppSpec(appSpecPath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(appSpecPath, 'utf-8');

    // Check minimum requirements
    const hasProjectName = content.includes('<project_name>');
    const hasOverview = content.includes('<overview>');
    const hasTechStack = content.includes('<technology_stack>');
    const hasFeatures = content.includes('<core_features>');
    const hasArchitecture = content.includes('<architecture_decisions>');

    const isValid = hasProjectName && hasOverview && hasTechStack && hasFeatures && hasArchitecture;

    if (!isValid) {
      console.error(`❌ [Synthesizer] app_spec.txt validation failed:`);
      if (!hasProjectName) console.error(`   - Missing: <project_name>`);
      if (!hasOverview) console.error(`   - Missing: <overview>`);
      if (!hasTechStack) console.error(`   - Missing: <technology_stack>`);
      if (!hasFeatures) console.error(`   - Missing: <core_features>`);
      if (!hasArchitecture) console.error(`   - Missing: <architecture_decisions>`);
    } else {
      console.log(`✅ [Synthesizer] app_spec.txt validation passed`);
    }

    return isValid;
  } catch (error) {
    console.error(`❌ [Synthesizer] Failed to validate app_spec.txt:`, error);
    return false;
  }
}
