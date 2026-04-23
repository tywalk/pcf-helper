---
name: pcf-helper
description: Build, deploy, upgrade, import, and run development sessions for Power Apps Component Framework (PCF) controls via @tywalk/pcf-helper and @tywalk/pcf-helper-run. Handles named profiles (dev/test/prod etc.) stored in pcf-helper.config.json so common parameters (environment, publisher, solution path) don't need to be repeated. Trigger when the user says anything like "deploy the control", "deploy to dev/test/prod", "build and deploy", "push PCF to <env>", "start a PCF session", "upgrade PCF deps", or references pcf-helper, pcf-helper-run, pcf-helper-deploy, ControlManifest, or a PCF solution folder. Do NOT use for: generative pages, canvas apps, C# plugins, Power Automate flows, Power BI, or model-driven form scripts.
---

# pcf-helper skill

Run and orchestrate the `@tywalk/pcf-helper-run` CLI. Turns vague requests like "deploy to dev" into the correct flags by reading the user's `pcf-helper.config.json` profiles.

## When this skill applies

- Any request to build, deploy, import, or upgrade a PCF control.
- Any request mentioning a named environment (dev/test/prod/etc.) in a PCF context.
- Starting a development session (live-reload via pcf-helper-session).
- Initializing a new PCF control.

## The CLI at a glance

Prefer `pcf-helper-run` (unified). The individual binaries (`pcf-helper-deploy`, etc.) also exist and accept the same flags.

| Command | Purpose |
|---------|---------|
| `pcf-helper-run init` | Scaffold a new PCF project |
| `pcf-helper-run upgrade` | Upgrade PCF project deps |
| `pcf-helper-run build` | Build the control |
| `pcf-helper-run import` | Import the built control into a Dataverse env |
| `pcf-helper-run deploy` | upgrade + build + import in one shot |
| `pcf-helper-run session` | Live dev session (intercepts bundle in a running browser) |
| `pcf-helper-run profile <list\|show\|current\|paths>` | Inspect profiles defined in pcf-helper.config.json |

## Profiles — how to resolve what the user actually wants

Every command accepts `-P, --profile <name>`. Profiles come from two files merged together (project overrides global):

1. `~/.pcf-helper/config.json` — global
2. `./pcf-helper.config.json` — project-level (in the directory the user is running from)

Config shape:

```json
{
  "defaultProfile": "dev",
  "profiles": {
    "dev":  { "environment": "DevEnv",  "publisherName": "Tyler W", "publisherPrefix": "tyw", "path": "./MySolution" },
    "test": { "environment": "TestEnv" },
    "prod": { "environment": "ProdEnv" }
  },
  "session": {
    "remoteEnvironmentUrl": "https://org.crm.dynamics.com",
    "localBundlePath": "out/controls/MyControl/bundle.js",
    "startWatch": true
  }
}
```

Precedence for build/deploy/import/upgrade/init: **CLI flag > active profile > defaults**.

Precedence for session: **CLI flag > env var > active profile `session` > top-level `session` > legacy `session.config.json` > defaults**.

### Before running a command

1. **Discover profiles before guessing.** Run `pcf-helper-run profile list` (or `pcf-helper-profile list`) to see what's defined. Don't invent profile names.
2. **Map the user's words to a profile.** "deploy to dev" / "push to dev" / "ship to dev" → `--profile dev`. "deploy to production" / "prod" → `--profile prod`. "deploy" with no env hint → omit `--profile` (defaults apply).
3. **If the user says something that doesn't match any configured profile**, show them the configured list and ask which one they meant rather than guessing.
4. **CLI flags always override.** If the user says "deploy to dev but point at the hotfix env", that's `--profile dev --environment HotfixEnv`.

## Common workflows

### "Deploy the control to <env>"

```bash
# Uses the profile's environment; CLI path wins over profile path
pcf-helper-run deploy -p <solution-path> --profile <env>
```

If `path` is set in the profile, you can omit `-p` entirely:

```bash
pcf-helper-run deploy --profile <env>
```

### "Just build / just import"

```bash
pcf-helper-run build --profile <env>   # solo build
pcf-helper-run import --profile <env>  # assumes build output already exists
```

### "Start a dev session"

```bash
pcf-helper-run session --profile <env>
# add --watch to kick off pcf-scripts watch in parallel
pcf-helper-run session --profile <env> --watch
```

If the project has a `session.config.json`, it's still honored (lowest precedence). Don't create one automatically — prefer the `session` block in `pcf-helper.config.json` for new setups.

### "Upgrade the project"

```bash
pcf-helper-run upgrade --profile <env>
```

### "Init a new control"

```bash
pcf-helper-run init -n <ControlName> --profile <profile-with-publisher-info>
# CLI flags can override profile values
pcf-helper-run init -n <ControlName> --publisher-name "Override Pub" --publisher-prefix ovr
```

## Verbose mode

All commands accept `-v` / `--verbose`. Use it when debugging deploy failures so pac CLI output is surfaced.

## Timeouts

`build`, `import`, and `deploy` accept `-t, --timeout <ms>`. Default is 5 minutes for import. Increase if the solution is large or the environment is slow.

## When something goes wrong

- **"Path argument is required"** → neither the CLI nor the profile supplied a path. Either pass `-p <path>` or add `path` to the profile.
- **"Profile "<x>" not found"** → the user referenced a profile that doesn't exist. Run `pcf-helper-run profile list` and ask the user which of the available ones they meant.
- **`pac solution import` failures** → usually auth. Check `pac auth list` (run in a terminal). A wrong environment in the profile is another common culprit.
- **Session fails to intercept** → verify `remoteEnvironmentUrl`, `remoteScriptToIntercept`, and `localBundlePath` in either the profile's `session` block or `session.config.json`. A relative script path gets combined with the base URL automatically.

## Don'ts

- Don't hardcode environment URLs or publishers into ad-hoc commands when a profile would serve. Add the value to `pcf-helper.config.json` instead.
- Don't create a `session.config.json` for new setups — put session values in `pcf-helper.config.json` under the `session` key (or inside a profile's `session` key).
- Don't call `pac solution import` directly — use `pcf-helper-run deploy` or `pcf-helper-run import` so build/upgrade/import all stay in sync.
- Don't run `deploy` if the user only asked for a `build`. They'll push something they didn't intend.

## Quick reference: config paths

```bash
pcf-helper-run profile paths
# global:  /home/<user>/.pcf-helper/config.json  (or %USERPROFILE%\.pcf-helper\config.json on Windows)
# project: ./pcf-helper.config.json
# loaded:  <files that actually exist>
```
