import readline from 'readline';
import logger from '@tywalk/color-logger';
import {
  Profile,
  SessionConfig,
  writeProfile,
  WriteProfileResult,
} from './configUtil';

/**
 * Flags captured from the CLI for `profile init`. All fields are optional —
 * missing ones are either prompted for (interactive mode) or omitted entirely
 * (when `--no-interactive` is used).
 */
export interface ProfileInitOptions {
  name: string;
  environment?: string;
  publisherName?: string;
  publisherPrefix?: string;
  path?: string;
  template?: string;
  framework?: string;
  /** Optional session fields. If any are set the profile gets a `session` block. */
  sessionUrl?: string;
  sessionScript?: string;
  sessionBundle?: string;
  /** Write to ~/.pcf-helper/config.json instead of ./pcf-helper.config.json. */
  global?: boolean;
  /** Also set `defaultProfile: <name>` in the target file. */
  setDefault?: boolean;
  /** Overwrite an existing profile of the same name. */
  force?: boolean;
  /** Skip interactive prompts. Anything not passed as a flag is left empty. */
  nonInteractive?: boolean;
}

/** Pluggable async prompt used to ask for a single value. Tests inject a mock. */
export type PromptFn = (question: string, currentValue?: string) => Promise<string>;

/** Default prompt implementation using Node's built-in readline. */
export const defaultPrompt: PromptFn = (question, currentValue) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const displayDefault = currentValue ? ` [${currentValue}]` : '';
    rl.question(`${question}${displayDefault}: `, (answer) => {
      rl.close();
      const trimmed = answer.trim();
      resolve(trimmed || currentValue || '');
    });
  });

/**
 * Builds a Profile from the options, prompting for each field when interactive.
 *
 * Returns only the fields the user actually supplied — empty answers are not
 * written to disk, so a skipped prompt produces no key in the profile.
 */
export async function buildProfileFromOptions(
  options: ProfileInitOptions,
  prompt: PromptFn = defaultPrompt,
): Promise<Profile> {
  const interactive = !options.nonInteractive;

  const ask = async (question: string, current: string | undefined): Promise<string | undefined> => {
    if (!interactive) return current;
    const answer = await prompt(question, current);
    return answer || undefined;
  };

  const environment = await ask('Dataverse environment name', options.environment);
  const publisherName = await ask('Publisher display name', options.publisherName);
  const publisherPrefix = await ask('Publisher prefix (2-8 chars, e.g. "tyw")', options.publisherPrefix);
  const profilePath = await ask('Path to PCF solution folder (blank to skip)', options.path);
  const template = await ask('Control template (field|dataset; blank to skip)', options.template);
  const framework = await ask('Rendering framework (none|react; blank to skip)', options.framework);

  // Session fields are only prompted when the user passed at least one,
  // to keep the common path short.
  const anySessionFlag = options.sessionUrl || options.sessionScript || options.sessionBundle;
  let session: SessionConfig | undefined;
  if (anySessionFlag && interactive) {
    const url = await ask('Session: remote environment URL', options.sessionUrl);
    const script = await ask('Session: remote script to intercept', options.sessionScript);
    const bundle = await ask('Session: local bundle path', options.sessionBundle);
    session = {};
    if (url) session.remoteEnvironmentUrl = url;
    if (script) session.remoteScriptToIntercept = script;
    if (bundle) session.localBundlePath = bundle;
    if (Object.keys(session).length === 0) session = undefined;
  } else if (anySessionFlag) {
    // Non-interactive + some session flags passed — just use what was given.
    session = {};
    if (options.sessionUrl) session.remoteEnvironmentUrl = options.sessionUrl;
    if (options.sessionScript) session.remoteScriptToIntercept = options.sessionScript;
    if (options.sessionBundle) session.localBundlePath = options.sessionBundle;
    if (Object.keys(session).length === 0) session = undefined;
  }

  const profile: Profile = {};
  if (environment) profile.environment = environment;
  if (profilePath) profile.path = profilePath;
  if (publisherName) profile.publisherName = publisherName;
  if (publisherPrefix) profile.publisherPrefix = publisherPrefix;
  if (template) profile.template = template;
  if (framework) profile.framework = framework;
  if (session) profile.session = session;

  return profile;
}

/**
 * Orchestrates the full `profile init` flow: collect fields (prompting when
 * interactive), then write the profile to the target config file.
 */
export async function runProfileInit(
  options: ProfileInitOptions,
  prompt: PromptFn = defaultPrompt,
): Promise<WriteProfileResult> {
  if (!options.name || !options.name.trim()) {
    throw new Error('Profile name is required. Usage: profile init <name>');
  }

  const profile = await buildProfileFromOptions(options, prompt);

  const result = writeProfile(options.name, profile, {
    global: options.global,
    setDefault: options.setDefault,
    force: options.force,
  });

  const verb = result.replacedProfile ? 'Updated' : 'Created';
  logger.log(`${verb} profile "${options.name}" in ${result.filePath}`);
  if (options.setDefault) {
    logger.log(`Set "${options.name}" as the default profile.`);
  }

  return result;
}
