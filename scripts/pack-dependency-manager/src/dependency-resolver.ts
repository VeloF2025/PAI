#!/usr/bin/env bun
/**
 * Pack Dependency Management - Dependency Resolver
 *
 * Resolves pack dependencies, detects conflicts, and builds installation plans.
 * Uses version-resolver for semver matching and constraint solving.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type {
  IDependencyResolver,
  PackManifest,
  InstalledPack,
  InstallationPlan,
  ResolvedDependency,
  VersionConflict,
  DependencyNode,
  ResolverOptions,
  SemanticVersion,
  VersionRange
} from './types';
import { VersionResolver } from './version-resolver';

/**
 * Default resolver options
 */
const DEFAULT_OPTIONS: ResolverOptions = {
  allowOptional: true,
  allowPeer: true,
  allowPrerelease: false,
  maxDepth: 10,
  strict: false
};

/**
 * Dependency resolver implementation
 */
export class DependencyResolver implements IDependencyResolver {
  private paiDir: string;
  private skillsDir: string;

  constructor(paiDir?: string) {
    this.paiDir = paiDir || process.env.PAI_DIR || join(process.env.HOME || process.env.USERPROFILE || '', '.claude');
    this.skillsDir = join(this.paiDir, 'skills');
  }

  /**
   * Resolve dependencies for a pack
   */
  async resolve(
    packName: string,
    versionRange: VersionRange = '*',
    options?: Partial<ResolverOptions>
  ): Promise<InstallationPlan> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Get installed pack or load manifest
    const installed = this.getInstalled(packName);
    let manifest: PackManifest;
    let resolvedVersion: SemanticVersion;

    if (installed) {
      manifest = installed.manifest;
      resolvedVersion = installed.version;
    } else {
      // Load manifest from pack directory
      const packPath = join(this.skillsDir, packName);
      manifest = this.loadManifest(packPath);
      resolvedVersion = manifest.version;
    }

    // Check if requested version satisfies
    if (versionRange !== '*' && !VersionResolver.satisfies(resolvedVersion, versionRange)) {
      throw new Error(
        `Pack ${packName} version ${resolvedVersion} does not satisfy requested range ${versionRange}`
      );
    }

    // Resolve all dependencies recursively
    const resolved: ResolvedDependency[] = [];
    const conflicts: VersionConflict[] = [];
    const visited = new Set<string>();

    await this.resolveDependenciesRecursive(
      packName,
      manifest,
      resolved,
      conflicts,
      visited,
      opts,
      0
    );

    // Build installation actions
    const actions = this.planActions(packName, resolvedVersion, resolved);

    return {
      target: packName,
      version: resolvedVersion,
      dependencies: resolved,
      conflicts,
      actions
    };
  }

  /**
   * Recursively resolve dependencies
   */
  private async resolveDependenciesRecursive(
    packName: string,
    manifest: PackManifest,
    resolved: ResolvedDependency[],
    conflicts: VersionConflict[],
    visited: Set<string>,
    options: ResolverOptions,
    depth: number
  ): Promise<void> {
    // Check max depth
    if (depth > options.maxDepth) {
      console.warn(`Max dependency depth ${options.maxDepth} reached for ${packName}`);
      return;
    }

    // Mark as visited
    visited.add(packName);

    // Resolve required dependencies
    if (manifest.dependencies) {
      for (const [depName, depRange] of Object.entries(manifest.dependencies)) {
        await this.resolveDependency(
          depName,
          depRange,
          packName,
          resolved,
          conflicts,
          visited,
          options,
          depth + 1,
          false // not optional
        );
      }
    }

    // Resolve optional dependencies if allowed
    if (options.allowOptional && manifest.optionalDependencies) {
      for (const [depName, depRange] of Object.entries(manifest.optionalDependencies)) {
        try {
          await this.resolveDependency(
            depName,
            depRange,
            packName,
            resolved,
            conflicts,
            visited,
            options,
            depth + 1,
            true // optional
          );
        } catch (error) {
          // Ignore errors for optional dependencies
          console.warn(`Optional dependency ${depName} could not be resolved:`, error);
        }
      }
    }

    // Check peer dependencies if allowed
    if (options.allowPeer && manifest.peerDependencies) {
      for (const [peerName, peerRange] of Object.entries(manifest.peerDependencies)) {
        const installed = this.getInstalled(peerName);
        if (!installed) {
          conflicts.push({
            packName: peerName,
            requestedBy: packName,
            requestedVersion: peerRange,
            conflictsWith: '',
            conflictingVersion: '',
            reason: `Peer dependency ${peerName}@${peerRange} is not installed`
          });
        } else if (!VersionResolver.satisfies(installed.version, peerRange)) {
          conflicts.push({
            packName: peerName,
            requestedBy: packName,
            requestedVersion: peerRange,
            conflictsWith: peerName,
            conflictingVersion: installed.version,
            reason: `Peer dependency version mismatch`
          });
        }
      }
    }

    // Check conflicts
    if (manifest.conflicts) {
      for (const [conflictName, conflictRange] of Object.entries(manifest.conflicts)) {
        const installed = this.getInstalled(conflictName);
        if (installed && VersionResolver.satisfies(installed.version, conflictRange)) {
          conflicts.push({
            packName: conflictName,
            requestedBy: packName,
            requestedVersion: '',
            conflictsWith: conflictName,
            conflictingVersion: installed.version,
            reason: `Pack ${packName} conflicts with ${conflictName}@${installed.version}`
          });
        }
      }
    }
  }

  /**
   * Resolve a single dependency
   */
  private async resolveDependency(
    depName: string,
    depRange: VersionRange,
    requestedBy: string,
    resolved: ResolvedDependency[],
    conflicts: VersionConflict[],
    visited: Set<string>,
    options: ResolverOptions,
    depth: number,
    isOptional: boolean
  ): Promise<void> {
    // Check if already resolved
    const existing = resolved.find(r => r.name === depName);
    if (existing) {
      // Check for version conflict
      if (!VersionResolver.rangesOverlap(existing.requestedVersion, depRange)) {
        conflicts.push({
          packName: depName,
          requestedBy,
          requestedVersion: depRange,
          conflictsWith: existing.requestedVersion,
          conflictingVersion: existing.resolvedVersion,
          reason: `Version conflict: ${requestedBy} requires ${depRange}, but ${depName}@${existing.resolvedVersion} is already resolved`
        });
      }
      return;
    }

    // Get installed version or find best match
    const installed = this.getInstalled(depName);
    let resolvedVersion: SemanticVersion;
    let installPath: string | undefined;

    if (installed) {
      // Check if installed version satisfies
      if (VersionResolver.satisfies(installed.version, depRange)) {
        resolvedVersion = installed.version;
        installPath = installed.installPath;
      } else {
        conflicts.push({
          packName: depName,
          requestedBy,
          requestedVersion: depRange,
          conflictsWith: depName,
          conflictingVersion: installed.version,
          reason: `Installed version ${installed.version} does not satisfy ${depRange}`
        });
        return;
      }
    } else {
      // Find best matching version from available
      const packPath = join(this.skillsDir, depName);
      if (!existsSync(packPath)) {
        if (!isOptional) {
          throw new Error(`Pack ${depName} not found at ${packPath}`);
        }
        return;
      }

      const manifest = this.loadManifest(packPath);
      resolvedVersion = manifest.version;

      // Check if version satisfies
      if (!VersionResolver.satisfies(resolvedVersion, depRange)) {
        if (!isOptional) {
          throw new Error(
            `Pack ${depName} version ${resolvedVersion} does not satisfy ${depRange}`
          );
        }
        return;
      }

      installPath = packPath;
    }

    // Add to resolved
    resolved.push({
      name: depName,
      requestedVersion: depRange,
      resolvedVersion,
      isInstalled: !!installed,
      installPath
    });

    // Recurse into dependencies if not visited
    if (!visited.has(depName)) {
      const manifest = installed?.manifest || this.loadManifest(installPath!);
      await this.resolveDependenciesRecursive(
        depName,
        manifest,
        resolved,
        conflicts,
        visited,
        options,
        depth
      );
    }
  }

  /**
   * Plan installation actions based on resolved dependencies
   */
  private planActions(
    target: string,
    targetVersion: SemanticVersion,
    resolved: ResolvedDependency[]
  ): InstallationPlan['actions'] {
    const actions: InstallationPlan['actions'] = [];

    // Add target pack
    const targetInstalled = this.getInstalled(target);
    if (!targetInstalled) {
      actions.push({
        type: 'install',
        packName: target,
        toVersion: targetVersion,
        reason: 'New installation'
      });
    } else if (targetInstalled.version !== targetVersion) {
      const cmp = VersionResolver.compareVersions(targetVersion, targetInstalled.version);
      actions.push({
        type: cmp > 0 ? 'upgrade' : 'downgrade',
        packName: target,
        fromVersion: targetInstalled.version,
        toVersion: targetVersion,
        reason: `Version change requested`
      });
    } else {
      actions.push({
        type: 'skip',
        packName: target,
        toVersion: targetVersion,
        reason: 'Already installed at requested version'
      });
    }

    // Add dependency actions
    for (const dep of resolved) {
      if (dep.isInstalled) {
        actions.push({
          type: 'skip',
          packName: dep.name,
          toVersion: dep.resolvedVersion,
          reason: 'Dependency already satisfied'
        });
      } else {
        actions.push({
          type: 'install',
          packName: dep.name,
          toVersion: dep.resolvedVersion,
          reason: `Required by ${target}`
        });
      }
    }

    return actions;
  }

  /**
   * Check for version conflicts in installation plan
   */
  checkConflicts(plan: InstallationPlan): VersionConflict[] {
    return plan.conflicts;
  }

  /**
   * Get installed pack information
   */
  getInstalled(packName: string): InstalledPack | null {
    const packPath = join(this.skillsDir, packName);
    if (!existsSync(packPath)) {
      return null;
    }

    try {
      const manifest = this.loadManifest(packPath);
      return {
        name: packName,
        version: manifest.version,
        installPath: packPath,
        manifest,
        installedAt: new Date().toISOString(), // Would read from metadata
        installedBy: 'user' // Would read from metadata
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * List all installed packs
   */
  listInstalled(): InstalledPack[] {
    if (!existsSync(this.skillsDir)) {
      return [];
    }

    const packs: InstalledPack[] = [];
    const entries = readdirSync(this.skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const installed = this.getInstalled(entry.name);
        if (installed) {
          packs.push(installed);
        }
      }
    }

    return packs;
  }

  /**
   * Build dependency tree for a pack
   */
  async buildTree(packName: string): Promise<DependencyNode> {
    const installed = this.getInstalled(packName);
    if (!installed) {
      throw new Error(`Pack ${packName} is not installed`);
    }

    return this.buildTreeRecursive(packName, installed.manifest, 0, new Set());
  }

  /**
   * Recursively build dependency tree
   */
  private async buildTreeRecursive(
    packName: string,
    manifest: PackManifest,
    depth: number,
    visited: Set<string>
  ): Promise<DependencyNode> {
    const dependencies: DependencyNode[] = [];

    // Prevent circular dependencies
    if (visited.has(packName)) {
      return {
        name: packName,
        version: manifest.version,
        dependencies: [],
        depth,
        isOptional: false,
        isPeer: false
      };
    }

    visited.add(packName);

    // Add regular dependencies
    if (manifest.dependencies) {
      for (const [depName, depRange] of Object.entries(manifest.dependencies)) {
        const depInstalled = this.getInstalled(depName);
        if (depInstalled) {
          const depTree = await this.buildTreeRecursive(
            depName,
            depInstalled.manifest,
            depth + 1,
            new Set(visited)
          );
          dependencies.push(depTree);
        }
      }
    }

    // Add optional dependencies
    if (manifest.optionalDependencies) {
      for (const [depName, depRange] of Object.entries(manifest.optionalDependencies)) {
        const depInstalled = this.getInstalled(depName);
        if (depInstalled) {
          const depTree = await this.buildTreeRecursive(
            depName,
            depInstalled.manifest,
            depth + 1,
            new Set(visited)
          );
          depTree.isOptional = true;
          dependencies.push(depTree);
        }
      }
    }

    return {
      name: packName,
      version: manifest.version,
      dependencies,
      depth,
      isOptional: false,
      isPeer: false
    };
  }

  /**
   * Load pack manifest from directory
   */
  private loadManifest(packPath: string): PackManifest {
    const manifestPath = join(packPath, 'pack.json');
    if (!existsSync(manifestPath)) {
      throw new Error(`No pack.json found at ${packPath}`);
    }

    try {
      const content = readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content) as PackManifest;
    } catch (error) {
      throw new Error(`Failed to parse pack.json at ${packPath}: ${error.message}`);
    }
  }
}

// Utility for reading directory
function readdirSync(path: string, options: { withFileTypes: true }): any[] {
  const fs = require('fs');
  return fs.readdirSync(path, options);
}
