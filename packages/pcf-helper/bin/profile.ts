#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package.json';
import { loadPcfHelperConfig } from '../util/configUtil';

const program = new Command();

program
  .name('pcf-helper-profile')
  .description('Inspect pcf-helper profiles defined in pcf-helper.config.json')
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

program.parse();
