#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package.json';
import { loadPcfHelperConfig } from '../util/configUtil';
import { runProfileInit, ProfileInitOptions } from '../util/profileInitUtil';

const program = new Command();

program
  .name('pcf-helper-profile')
  .description('Inspect and manage pcf-helper profiles in pcf-helper.config.json')
  .version(version, '-v, --version');

program
  .command('list')
  .description('List all available profile names')
  .action(() => {
    const { merged, sources } = loadPcfHelperConfig();
    const names = Object.keys(merged.profiles ?? {});
    const isDefault = (n: string) => (merged.defaultProfile === n ? ' (default)' : '');

    if (sources.length === 0) {
      console.log('No pcf-helper config files found.');
      console.log('Looked at:');
      console.log('  - global: ~/.pcf-helper/config.json');
      console.log('  - project: ./pcf-helper.config.json');
      process.exit(0);
    }

    console.log('Loaded config from:');
    for (const s of sources) console.log(`  - ${s}`);

    if (names.length === 0) {
      console.log('\nNo profiles defined.');
      process.exit(0);
    }

    console.log('\nProfiles:');
    for (const n of names) console.log(`  - ${n}${isDefault(n)}`);
  });

program
  .command('show <name>')
  .description('Print the resolved contents of a profile')
  .action((name: string) => {
    const { merged } = loadPcfHelperConfig();
    const profile = merged.profiles?.[name];
    if (!profile) {
      const available = Object.keys(merged.profiles ?? {});
      console.error(`Profile "${name}" not found. Available: ${available.join(', ') || '(none)'}`);
      process.exit(1);
    }
    console.log(JSON.stringify(profile, null, 2));
  });

program
  .command('current')
  .description('Print the profile that would be used by default')
  .action(() => {
    const { merged } = loadPcfHelperConfig();
    if (!merged.defaultProfile) {
      console.log('No defaultProfile set.');
      return;
    }
    console.log(merged.defaultProfile);
  });

program
  .command('paths')
  .description('Print the global and project config paths (whether or not they exist)')
  .action(() => {
    const { merged: _m, projectPath, globalPath, sources } = loadPcfHelperConfig();
    void _m;
    console.log(`global:  ${globalPath}`);
    console.log(`project: ${projectPath}`);
    console.log(`loaded:  ${sources.length ? sources.join(', ') : '(none)'}`);
  });

program
  .command('init <name>')
  .description('Create a new profile in pcf-helper.config.json (project or global)')
  .option('-e, --environment <env>', 'Dataverse environment name')
  .option('--publisher-name <name>', 'publisher display name')
  .option('--publisher-prefix <prefix>', 'publisher prefix (2-8 chars)')
  .option('-p, --path <path>', 'path to PCF solution folder')
  .option('--template <template>', 'control template (field|dataset)')
  .option('--framework <framework>', 'rendering framework (none|react)')
  .option('--session-url <url>', 'session: remote environment URL')
  .option('--session-script <path>', 'session: remote script to intercept')
  .option('--session-bundle <path>', 'session: local bundle path')
  .option('-g, --global', 'write to ~/.pcf-helper/config.json instead of project-level')
  .option('-d, --set-default', 'set this profile as the defaultProfile')
  .option('-f, --force', 'overwrite an existing profile of the same name')
  .option('--no-interactive', 'skip prompts for missing fields')
  .action(async (name: string, flags: Record<string, unknown>) => {
    const options: ProfileInitOptions = {
      name,
      environment: flags.environment as string | undefined,
      publisherName: flags.publisherName as string | undefined,
      publisherPrefix: flags.publisherPrefix as string | undefined,
      path: flags.path as string | undefined,
      template: flags.template as string | undefined,
      framework: flags.framework as string | undefined,
      sessionUrl: flags.sessionUrl as string | undefined,
      sessionScript: flags.sessionScript as string | undefined,
      sessionBundle: flags.sessionBundle as string | undefined,
      global: !!flags.global,
      setDefault: !!flags.setDefault,
      force: !!flags.force,
      nonInteractive: flags.interactive === false,
    };
    try {
      await runProfileInit(options);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Error: ${message}`);
      process.exit(1);
    }
  });

program.parseAsync();
