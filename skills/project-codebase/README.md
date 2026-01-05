# project-codebase

Project-specific codebase knowledge and reference documentation.

## Purpose

This skill provides project-specific knowledge bases for different codebases, allowing Claude Code to have deep context about specific projects.

## Features

- Project-specific code patterns and conventions
- Architecture documentation
- Common workflows and procedures
- Technical reference material

## Usage

This skill is automatically loaded when working on projects that have corresponding knowledge files.

## Files

- `life-arrow-v1-knowledge.md` - Life Arrow v1 project knowledge base

## Adding Project Knowledge

To add knowledge for a new project:

1. Create a new `.md` file in this directory
2. Name it `{project-name}-knowledge.md`
3. Document project-specific information:
   - Architecture overview
   - Code patterns
   - Common procedures
   - Technical decisions

## Pack v2.0 Compliance

This skill follows the Pack v2.0 specification:
- ✅ README.md (this file)
- ✅ INSTALL.md (installation guide)
- ✅ VERIFY.md (verification checklist)
- ✅ src/ (source code)

---

**Skill Type**: Reference/Knowledge
**Format**: Pack v2.0
