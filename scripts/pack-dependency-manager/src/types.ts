#!/usr/bin/env bun
/**
 * Pack Dependency Management - Type Definitions
 *
 * Comprehensive types for pack manifests, dependency resolution,
 * version management, and conflict detection.
 */

/**
 * Semantic version string (semver 2.0.0)
 */
export type SemanticVersion = string;

/**
 * Version range specification
 * - ^1.0.0: Compatible with 1.x.x (>=1.0.0 <2.0.0)
 * - ~1.2.0: Approximately 1.2.x (>=1.2.0 <1.3.0)
 * - >=1.0.0: Greater than or equal to
 * - 1.0.0: Exact version
 */
export type VersionRange = string;

/**
 * Pack category for organization
 */
export type PackCategory =
  | 'automation'
  | 'development'
  | 'observability'
  | 'validation'
  | 'research'
  | 'integration'
  | 'security';

/**
 * Operating system identifiers
 */
export type OS = 'linux' | 'darwin' | 'win32';

/**
 * Pack manifest (pack.json)
 */
export interface PackManifest {
  // Required fields
  name: string;
  version: SemanticVersion;

  // Metadata
  description?: string;
  author?: string;
  license?: string;
  category?: PackCategory;
  keywords?: string[];
  homepage?: string;
  repository?: {
    type: 'git';
    url: string;
  };

  // Dependency management
  dependencies?: Record<string, VersionRange>;
  peerDependencies?: Record<string, VersionRange>;
  devDependencies?: Record<string, VersionRange>;
  optionalDependencies?: Record<string, VersionRange>;

  // Pack capabilities
  provides?: {
    hooks?: string[];
    skills?: string[];
    tools?: string[];
    mcps?: string[];
    utilities?: string[];
  };

  // Conflict management
  conflicts?: Record<string, VersionRange>;

  // Environment requirements
  engines?: {
    bun?: VersionRange;
    node?: VersionRange;
    'claude-code'?: VersionRange;
  };
  os?: OS[];

  // Lifecycle scripts
  scripts?: {
    preinstall?: string;
    install?: string;
    postinstall?: string;
    test?: string;
    verify?: string;
    uninstall?: string;
  };

  // Configuration
  config?: Record<string, any>;

  // Distribution
  files?: string[];
}

/**
 * Installed pack information
 */
export interface InstalledPack {
  name: string;
  version: SemanticVersion;
  installPath: string;
  manifest: PackManifest;
  installedAt: string; // ISO timestamp
  installedBy: 'user' | 'dependency' | 'auto';
}

/**
 * Dependency resolution result
 */
export interface ResolvedDependency {
  name: string;
  requestedVersion: VersionRange;
  resolvedVersion: SemanticVersion;
  isInstalled: boolean;
  installPath?: string;
}

/**
 * Dependency tree node
 */
export interface DependencyNode {
  name: string;
  version: SemanticVersion;
  dependencies: DependencyNode[];
  depth: number;
  isOptional: boolean;
  isPeer: boolean;
}

/**
 * Version conflict
 */
export interface VersionConflict {
  packName: string;
  requestedBy: string;
  requestedVersion: VersionRange;
  conflictsWith: string;
  conflictingVersion: VersionRange;
  reason: string;
}

/**
 * Installation plan
 */
export interface InstallationPlan {
  target: string; // Pack to install
  version: SemanticVersion;
  dependencies: ResolvedDependency[];
  conflicts: VersionConflict[];
  actions: InstallationAction[];
}

/**
 * Installation action
 */
export interface InstallationAction {
  type: 'install' | 'upgrade' | 'downgrade' | 'skip';
  packName: string;
  fromVersion?: SemanticVersion;
  toVersion: SemanticVersion;
  reason: string;
}

/**
 * Dependency resolver options
 */
export interface ResolverOptions {
  allowOptional: boolean; // Install optional dependencies
  allowPeer: boolean; // Verify peer dependencies
  allowPrerelease: boolean; // Allow pre-release versions
  maxDepth: number; // Maximum dependency depth
  strict: boolean; // Strict version matching
}

/**
 * Dependency resolver interface
 */
export interface IDependencyResolver {
  /**
   * Resolve dependencies for a pack
   */
  resolve(
    packName: string,
    versionRange: VersionRange,
    options?: Partial<ResolverOptions>
  ): Promise<InstallationPlan>;

  /**
   * Check for version conflicts
   */
  checkConflicts(plan: InstallationPlan): VersionConflict[];

  /**
   * Get installed pack info
   */
  getInstalled(packName: string): InstalledPack | null;

  /**
   * Get all installed packs
   */
  listInstalled(): InstalledPack[];

  /**
   * Build dependency tree
   */
  buildTree(packName: string): Promise<DependencyNode>;
}

/**
 * Pack registry interface
 */
export interface IPackRegistry {
  /**
   * Get pack manifest
   */
  getManifest(packName: string, version?: SemanticVersion): Promise<PackManifest | null>;

  /**
   * Get available versions for a pack
   */
  getVersions(packName: string): Promise<SemanticVersion[]>;

  /**
   * Search for packs
   */
  search(query: string): Promise<PackManifest[]>;

  /**
   * Check if pack exists
   */
  exists(packName: string): Promise<boolean>;
}

/**
 * Pack installer interface
 */
export interface IPackInstaller {
  /**
   * Install a pack and its dependencies
   */
  install(
    packName: string,
    versionRange?: VersionRange,
    options?: Partial<ResolverOptions>
  ): Promise<InstallationResult>;

  /**
   * Uninstall a pack
   */
  uninstall(packName: string, removeDependent?: boolean): Promise<UninstallResult>;

  /**
   * Upgrade a pack to latest version
   */
  upgrade(packName: string): Promise<InstallationResult>;

  /**
   * Verify pack installation
   */
  verify(packName: string): Promise<VerificationResult>;
}

/**
 * Installation result
 */
export interface InstallationResult {
  success: boolean;
  packName: string;
  version: SemanticVersion;
  installed: string[]; // Packs installed
  upgraded: string[]; // Packs upgraded
  skipped: string[]; // Packs skipped
  errors: InstallationError[];
  duration: number; // milliseconds
}

/**
 * Installation error
 */
export interface InstallationError {
  packName: string;
  error: string;
  stack?: string;
}

/**
 * Uninstall result
 */
export interface UninstallResult {
  success: boolean;
  packName: string;
  removed: string[]; // Files removed
  remainingDependent: string[]; // Packs that still depend on this
  errors: string[];
}

/**
 * Verification result
 */
export interface VerificationResult {
  packName: string;
  isValid: boolean;
  checks: VerificationCheck[];
  errors: string[];
}

/**
 * Verification check
 */
export interface VerificationCheck {
  name: string;
  description: string;
  passed: boolean;
  error?: string;
}

/**
 * Lock file entry
 */
export interface LockEntry {
  name: string;
  version: SemanticVersion;
  resolved: string; // Path or URL
  integrity?: string; // Hash for verification
  dependencies?: Record<string, SemanticVersion>;
}

/**
 * Lock file (pack-lock.json)
 */
export interface LockFile {
  version: string; // Lock file format version
  generated: string; // ISO timestamp
  packages: Record<string, LockEntry>;
}
