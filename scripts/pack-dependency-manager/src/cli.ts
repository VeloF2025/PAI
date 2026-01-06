#!/usr/bin/env bun
/**
 * Pack Dependency Manager - CLI Tool
 *
 * Command-line interface for managing pack dependencies.
 */

import { DependencyResolver } from './dependency-resolver';
import { VersionResolver } from './version-resolver';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const resolver = new DependencyResolver();

  switch (command) {
    case 'resolve': {
      const packName = args[1];
      const versionRange = args[2] || '*';
      console.log(`\nResolving dependencies for ${packName}@${versionRange}...\n`);

      const plan = await resolver.resolve(packName, versionRange);
      console.log(`Target: ${plan.target}@${plan.version}`);
      console.log(`\nDependencies (${plan.dependencies.length}):`);
      for (const dep of plan.dependencies) {
        console.log(`  - ${dep.name}@${dep.resolvedVersion} ${dep.isInstalled ? '✅' : '📦'}`);
      }

      if (plan.conflicts.length > 0) {
        console.log(`\n⚠️  Conflicts (${plan.conflicts.length}):`);
        for (const conflict of plan.conflicts) {
          console.log(`  - ${conflict.reason}`);
        }
      }

      console.log(`\nActions (${plan.actions.length}):`);
      for (const action of plan.actions) {
        const icon = action.type === 'install' ? '📦' : action.type === 'upgrade' ? '⬆️' : action.type === 'downgrade' ? '⬇️' : '⏭️';
        console.log(`  ${icon} ${action.type} ${action.packName}@${action.toVersion}`);
      }
      break;
    }

    case 'list': {
      const installed = resolver.listInstalled();
      console.log(`\nInstalled Packs (${installed.length}):\n`);
      for (const pack of installed) {
        console.log(`  ${pack.name}@${pack.version}`);
      }
      break;
    }

    case 'tree': {
      const packName = args[1];
      const tree = await resolver.buildTree(packName);
      console.log(`\nDependency Tree for ${packName}:\n`);
      printTree(tree, '');
      break;
    }

    case 'check': {
      const versionRange = args[1];
      const version = args[2];

      const satisfies = VersionResolver.satisfies(version, versionRange);
      console.log(`\n${version} ${satisfies ? '✅ satisfies' : '❌ does not satisfy'} ${versionRange}\n`);
      break;
    }

    default:
      console.log(`
Pack Dependency Manager - CLI

Usage:
  bun cli.ts resolve <pack> [version]  - Resolve dependencies
  bun cli.ts list                      - List installed packs
  bun cli.ts tree <pack>               - Show dependency tree
  bun cli.ts check <range> <version>   - Check version satisfaction
      `);
  }
}

function printTree(node: any, prefix: string): void {
  console.log(`${prefix}${node.name}@${node.version}${node.isOptional ? ' (optional)' : ''}`);
  const children = node.dependencies || [];
  for (let i = 0; i < children.length; i++) {
    const isLast = i === children.length - 1;
    const newPrefix = prefix + (isLast ? '  └─ ' : '  ├─ ');
    printTree(children[i], newPrefix);
  }
}

main().catch(console.error);
