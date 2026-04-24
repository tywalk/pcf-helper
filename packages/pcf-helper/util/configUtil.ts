import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from '@tywalk/color-logger';

/**
 * Session-specific config values. These mirror the fields supported by the
 * legacy session.config.json so that callers have a single shape to consume.
 */
export interface SessionConfig {
  remoteEnvironmentUrl?: string;
  remoteScriptToIntercept?: string;
  remoteStylesheetToIntercept?: string;
  localCssPath?: string;
  localBundlePath?: string;
  startWatch?: boolean;
  watchRetry?: boolean;
}

/**
 * A named bundle of defaults that can feed build/deploy/import/upgrade/init and
 * (optionally) session. Any field may be omitted; fields left blank fall back
 * to the enclosing config or CLI-provided values.
 */
export interface Profile {
  environment?: string;
  path?: string;
  publisherName?: string;
  publisherPrefix?: string;
  template?: string;
  framework?: string;
  /** Optional session overrides specific to this profile. Layers over the
   *  top-level `session` block in the same file. */
  session?: SessionConfig;
}

/**
 * The on-disk shape of pcf-helper.config.json (and ~/.pcf-helper/config.json).
 */
export interface PcfHelperConfig {
  /** Name of the profile to use when --profile is not passed on the CLI. */
  defaultProfile?: string;
  profiles?: Record<string, Profile>;
  /** Shared session settings used by the session command. */
  session?: SessionConfig;
}

export interface LoadedConfig {
  /**
   * Merged config where project values override global values field-by-field
   * and profile maps are merged by name (project profile of the same name
   * wins). This is the only object callers should read from.
   */
  merged: PcfHelperConfig;
  projectPath: string;
  globalPath: string;
  /** Ordered list of files that actually existed and contributed values. */
  sources: string[];
}

const PROJECT_CONFIG_NAME = 'pcf-helper.config.json';
const GLOBAL_CONFIG_DIR_NAME = '.pcf-helper';
const GLOBAL_CONFIG_FILE_NAME = 'config.json';

export function getGlobalConfigPath(): string {
  return path.join(os.homedir(), GLOBAL_CONFIG_DIR_NAME, GLOBAL_CONFIG_FILE_NAME);
}

export function getProjectConfigPath(cwd: string = process.cwd()): string {
  return path.join(cwd, PROJECT_CONFIG_NAME);
}

function readJsonIfExists(filePath: string): PcfHelperConfig | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as PcfHelperConfig;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    logger.warn(`⚠️ Failed to parse pcf-helper config at ${filePath}: ${message}`);
    return undefined;
  }
}

/**
 * Loads the global then project pcf-helper configs and returns a merged view.
 * Project-level values override global values. Profiles from both files are
 * merged by name (project wins on collision).
 *
 * Missing files are treated as empty objects. Malformed JSON produces a
 * warning and is also treated as empty.
 */
export function loadPcfHelperConfig(cwd: string = process.cwd()): LoadedConfig {
  const globalPath = getGlobalConfigPath();
  const projectPath = getProjectConfigPath(cwd);

  const globalCfg = readJsonIfExists(globalPath) ?? {};
  const projectCfg = readJsonIfExists(projectPath) ?? {};

  const sources: string[] = [];
  if (fs.existsSync(globalPath)) sources.push(globalPath);
  if (fs.existsSync(projectPath)) sources.push(projectPath);

  const mergedProfiles: Record<string, Profile> = {
    ...(globalCfg.profiles ?? {}),
    ...(projectCfg.profiles ?? {}),
  };

  const mergedSession: SessionConfig = {
    ...(globalCfg.session ?? {}),
    ...(projectCfg.session ?? {}),
  };

  const merged: PcfHelperConfig = {
    defaultProfile: projectCfg.defaultProfile ?? globalCfg.defaultProfile,
    profiles: mergedProfiles,
    session: mergedSession,
  };

  return { merged, projectPath, globalPath, sources };
}

/**
 * Resolves the profile to use: explicit --profile flag wins, else
 * `defaultProfile`, else undefined.
 *
 * Throws a clear error if a profile name is resolved but the config has no
 * matching entry.
 */
export function resolveProfile(
  requestedName: string | undefined,
  merged: PcfHelperConfig,
): { name?: string; profile?: Profile } {
  const name = requestedName ?? merged.defaultProfile;
  if (!name) return {};
  const profile = merged.profiles?.[name];
  if (!profile) {
    const available = Object.keys(merged.profiles ?? {});
    const list = available.length > 0 ? available.join(', ') : '(none)';
    throw new Error(
      `Profile "${name}" not found. Available profiles: ${list}. Check pcf-helper.config.json (global or project).`,
    );
  }
  return { name, profile };
}

/**
 * Layers session config values highest-wins. Undefined values in later layers
 * do not overwrite defined values in earlier layers — pass layers from
 * lowest-precedence to highest-precedence.
 */
export function mergeSessionConfig(
  ...layers: (SessionConfig | undefined)[]
): SessionConfig {
  const result: SessionConfig = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of Object.keys(layer) as (keyof SessionConfig)[]) {
      const value = layer[key];
      if (value !== undefined) {
        // TS: assignment to union member is safe because we're copying the same key
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }
  return result;
}

/**
 * Options for writing a new or updated profile to a pcf-helper config file.
 */
export interface WriteProfileOptions {
  /** If true, write to the global config (~/.pcf-helper/config.json). Default: project-level. */
  global?: boolean;
  /** If true, also set `defaultProfile: <name>` in the target file. */
  setDefault?: boolean;
  /** If true, overwrite an existing profile of the same name. If false (default) and the name already exists, throws. */
  force?: boolean;
  /** Override the working directory (for project-level writes). Mainly useful in tests. */
  cwd?: string;
}

export interface WriteProfileResult {
  /** Absolute path of the file that was written. */
  filePath: string;
  /** True if the target file did not exist before this call. */
  createdFile: boolean;
  /** True if an existing profile of the same name was replaced. */
  replacedProfile: boolean;
}

/**
 * Writes a profile into the target pcf-helper config file, merging with any
 * existing content. Creates the parent directory and the file itself if
 * neither exists. Writes atomically (temp + rename) so a failed mid-write
 * cannot corrupt the config.
 *
 * Throws if the profile name already exists and `force` is not set.
 */
export function writeProfile(
  name: string,
  profile: Profile,
  options: WriteProfileOptions = {},
): WriteProfileResult {
  if (!name || !name.trim()) {
    throw new Error('Profile name is required.');
  }

  const targetPath = options.global
    ? getGlobalConfigPath()
    : getProjectConfigPath(options.cwd);

  const fileExisted = fs.existsSync(targetPath);
  const existing: PcfHelperConfig = fileExisted
    ? (readJsonIfExists(targetPath) ?? {})
    : {};

  const existingProfile = existing.profiles?.[name];
  if (existingProfile && !options.force) {
    throw new Error(
      `Profile "${name}" already exists in ${targetPath}. Pass --force to overwrite.`,
    );
  }

  const next: PcfHelperConfig = {
    ...existing,
    profiles: {
      ...(existing.profiles ?? {}),
      [name]: profile,
    },
  };

  if (options.setDefault) {
    next.defaultProfile = name;
  }

  // Ensure parent directory exists (matters for ~/.pcf-helper/ on first use).
  const parentDir = path.dirname(targetPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Atomic write: write to a temp file in the same directory, then rename.
  const tmpPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  const serialized = JSON.stringify(next, null, 2) + '\n';
  fs.writeFileSync(tmpPath, serialized, 'utf8');
  fs.renameSync(tmpPath, targetPath);

  return {
    filePath: targetPath,
    createdFile: !fileExisted,
    replacedProfile: !!existingProfile,
  };
}
