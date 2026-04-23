# PCF Helper Run 🎯

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helper-run.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helper-run)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Unified CLI interface for all Power Platform Component Framework (PCF) operations.**

This package provides a single, consolidated command-line interface that brings together all PCF Helper functionality under one roof. Perfect for developers who prefer a unified experience and simplified command structure.

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Command Structure](#️-command-structure)
- [Available Subcommands](#️-available-subcommands)
- [Profiles](#-profiles)
- [Usage Examples](#-detailed-command-reference)
- [Workflow Examples](#-workflow-examples)
- [Global Options](#️-global-options)
- [Troubleshooting](#-troubleshooting)

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @tywalk/pcf-helper-run
```

### Local Installation

```bash
npm install @tywalk/pcf-helper-run
```

### Verify Installation

```bash
pcf-helper-run --version
pcf-helper-run --help
```

## 🚀 Quick Start

### Basic Usage Pattern

```bash
pcf-helper-run <subcommand> [options]
```

### Your First PCF Control

```bash
# 1. Initialize a new PCF project
pcf-helper-run init -n "MyFirstControl" --publisher-name "My Company"

# 2. Navigate to the created project
cd MyFirstControl

# 3. Build the control
pcf-helper-run build -p .

# 4. Import to your solution
pcf-helper-run import -p .
```

## 🏗️ Command Structure

PCF Helper Run uses a subcommand structure for organized functionality:

```bash
pcf-helper-run <subcommand> [options]
```

Each subcommand corresponds to a specific PCF operation, with consistent option patterns across all commands.

## 🛠️ Available Subcommands

| Subcommand | Description | Equivalent Individual Command |
|------------|-------------|-------------------------------|
| `init` | Initialize new PCF project | `pcf-helper-init` |
| `build` | Build and compile controls | `pcf-helper-build` |
| `import` | Import controls to solution | `pcf-helper-import` |
| `deploy` | Deploy to environment (upgrade + build + import) | `pcf-helper-deploy` |
| `upgrade` | Upgrade project dependencies | `pcf-helper-upgrade` |
| `session` | Manage development sessions | `pcf-helper-session` |
| `profile` | Inspect named profiles (`list`, `show`, `current`, `paths`) | `pcf-helper-profile` |

## 🧭 Profiles

Every command accepts `-P, --profile <name>` so you don't have to retype `--environment`, `--path`, `--publisher-name`, or `--publisher-prefix` on every run. Profiles are defined in a JSON config file that's merged from two places (project overrides global):

1. `~/.pcf-helper/config.json` — global defaults for this machine.
2. `./pcf-helper.config.json` — project-specific overrides.

Example config:

```json
{
  "defaultProfile": "dev",
  "profiles": {
    "dev":  { "environment": "DevEnv",  "publisherName": "Tyler W", "publisherPrefix": "tyw" },
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

### Precedence (highest wins)

For `build`, `deploy`, `import`, `upgrade`, `init`:
1. Explicit CLI flags
2. Active profile (`--profile <name>` or `defaultProfile`)
3. Defaults

For `session`:
1. Explicit CLI flags
2. Environment variables
3. Active profile's `session` block
4. Top-level `session` block in `pcf-helper.config.json`
5. Legacy `session.config.json` (kept for backward compatibility)
6. Defaults

### Usage

```bash
# Use the default profile
pcf-helper-run deploy -p ./MySolution

# Pick a specific profile
pcf-helper-run deploy -p ./MySolution --profile prod

# CLI flags always win
pcf-helper-run deploy -p ./MySolution --profile prod --environment HotfixEnv

# Inspect what is configured
pcf-helper-run profile list
pcf-helper-run profile show prod
pcf-helper-run profile current
pcf-helper-run profile paths
```

## 📖 Detailed Command Reference

### 🏗️ init - Initialize New Project

Create a new PCF project with proper scaffolding.

```bash
pcf-helper-run init -n <control-name> [options]
```

#### Required Parameters

- `-n, --name <name>` - Name of the PCF control

#### Optional Parameters

- `--publisher-name <name>` - Publisher name
- `--publisher-prefix <prefix>` - Publisher prefix
- `-p, --path <path>` - Creation path (default: current directory)
- `--run-npm-install` - Run npm install after creation (default: true)

#### Examples

```bash
# Simple initialization
pcf-helper-run init -n "CustomerLookup"

# Full configuration
pcf-helper-run init -n "CustomerLookup" \
  --publisher-name "Contoso Corporation" \
  --publisher-prefix "con" \
  -p ./my-controls \
  --verbose

# Skip npm install for faster scaffolding
pcf-helper-run init -n "QuickControl" --run-npm-install false
```

### ⚡ build - Build Controls

Compile and build your PCF controls for deployment.

```bash
pcf-helper-run build -p <solution-path> [options]
```

#### Required Parameters

- `-p, --path <path>` - Path to the solution folder

#### Optional Parameters

- `-e, --environment <environment>` - Target environment configuration
- `--env <environment>` - (Deprecated: use `--environment`) Target environment
- `-t, --timeout <milliseconds>` - Build timeout (default: 300000)

#### Examples

```bash
# Basic build
pcf-helper-run build -p ./MySolution

# Build with environment and extended timeout
pcf-helper-run build -p ./MySolution --environment Production --timeout 120000

# Verbose build for debugging
pcf-helper-run build -p ./MySolution --verbose
```

### 📦 import - Import to Solution

Import your built PCF controls into a Dataverse solution.

```bash
pcf-helper-run import -p <solution-path> [options]
```

#### Required Parameters

- `-p, --path <path>` - Path to the solution folder

#### Optional Parameters

- `-e, --environment <environment>` - Target environment
- `--env <environment>` - (Deprecated: use `--environment`) Target environment
- `-t, --timeout <milliseconds>` - Import timeout

#### Examples

```bash
# Import to default environment
pcf-helper-run import -p .

# Import to specific environment
pcf-helper-run import -p . --environment "Test Environment"

# Extended timeout for large solutions
pcf-helper-run import -p . --timeout 180000
```

### 🚀 deploy - Deploy to Environment

Deploy your PCF controls to the target Dataverse environment. This command runs upgrade, build, and import in sequence.

```bash
pcf-helper-run deploy -p <solution-path> [options]
```

#### Required Parameters

- `-p, --path <path>` - Path to the solution folder

#### Optional Parameters

- `-e, --environment <environment>` - Target environment for deployment
- `--env <environment>` - (Deprecated: use `--environment`) Target environment
- `-t, --timeout <milliseconds>` - Deployment timeout

#### Examples

```bash
# Deploy to default environment
pcf-helper-run deploy -p .

# Deploy to production with extended timeout
pcf-helper-run deploy -p . --environment "Production" --timeout 300000
```

### 🔄 upgrade - Upgrade Project

Upgrade your PCF project dependencies and framework versions.

```bash
pcf-helper-run upgrade -p <solution-path> [options]
```

#### Required Parameters

- `-p, --path <path>` - Path to the solution folder

#### Examples

```bash
# Upgrade project dependencies
pcf-helper-run upgrade -p .

# Upgrade with verbose output
pcf-helper-run upgrade -p . --verbose
```

### 🎯 session - Manage Development Sessions

Manage development sessions with live reloading capabilities.

```bash
pcf-helper-run session [options]
```

#### Optional Parameters

- `-u, --url <url>` - Remote environment URL
- `-s, --script <path>` - Remote script to intercept
- `-t, --stylesheet <path>` - Remote stylesheet to intercept
- `-b, --bundle <path>` - Local bundle path
- `-c, --css <path>` - Local CSS path
- `-f, --config <path>` - Config file path (default: `session.config.json`)
- `-w, --watch` - Start pcf-scripts watch process to automatically rebuild on changes
- `--watch-retry <true|false>` - Controls watch failure behavior when `--watch` is enabled: `true` auto-retries, `false` prompts for manual restart (default: `true`)

#### Configuration File

Create a `session.config.json` file in your project root to avoid passing parameters repeatedly:

```json
{
  "remoteEnvironmentUrl": "https://contoso-dev.crm.dynamics.com",
  "remoteScriptToIntercept": "/webresources/pub_MyControl/bundle.js",
  "remoteStylesheetToIntercept": "/webresources/pub_MyControl/css/MyControl.css",
  "localBundlePath": "./out/controls/MyControl/bundle.js",
  "localCssPath": "./out/controls/MyControl/css/MyControl.css",
  "startWatch": false,
  "watchRetry": true
}
```

#### Examples

```bash
# Start session with default config
pcf-helper-run session

# Session with custom configuration
pcf-helper-run session -u "https://contoso.crm.dynamics.com" -s /webresources/pub_MyControl/bundle.js -b ./bundle.js

# Session with watch mode for automatic rebuilds
pcf-helper-run session --watch

# Session with custom config file
pcf-helper-run session -f ./my-session.config.json
```

## ⚙️ Global Options

These options are available for all subcommands:

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Enable detailed logging | `false` |
| `--version` | Display version information | - |
| `-h, --help` | Show help for command | - |
| `-t, --timeout <ms>` | Operation timeout in milliseconds | `300000` |

### Global Usage Examples

```bash
# Enable verbose logging for any command
pcf-helper-run build -p . --verbose

# Set custom timeout
pcf-helper-run import -p . --timeout 120000

# Get help for specific subcommand
pcf-helper-run build --help
```

## 💼 Workflow Examples

### Complete Development Workflow

```bash
#!/bin/bash
# Complete PCF development and deployment script

set -e  # Exit on any error

echo "🏗️  Initializing PCF project..."
pcf-helper-run init -n "SalesCalculator" \
  --publisher-name "Contoso Sales" \
  --publisher-prefix "cs" \
  -p ./sales-calculator

echo "📂 Navigating to project directory..."
cd ./sales-calculator

echo "⚡ Building the control..."
pcf-helper-run build -p . --verbose

echo "📦 Importing to solution..."
pcf-helper-run import -p . --timeout 120000

echo "🚀 Deploying to test environment..."
pcf-helper-run deploy -p . --environment "Test"

echo "✅ Deployment complete!"
```

### Development with Multiple Environments

```bash
# Build and test locally
pcf-helper-run build -p .

# Deploy to development environment
pcf-helper-run deploy -p . --environment "Development"

# After testing, deploy to staging
pcf-helper-run deploy -p . --environment "Staging"

# Finally, deploy to production
pcf-helper-run deploy -p . --environment "Production"
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Command Not Found

```bash
# Verify installation
npm list -g @tywalk/pcf-helper-run

# Reinstall if necessary
npm uninstall -g @tywalk/pcf-helper-run
npm install -g @tywalk/pcf-helper-run
```

#### Build Failures

```bash
# Enable verbose mode for detailed error info
pcf-helper-run build -p . --verbose

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify prerequisites
pac --version
dotnet --version
```

#### Timeout Errors

```bash
# Increase timeout for large projects
pcf-helper-run build -p . --timeout 120000  # 2 minutes
```

#### Deprecated Flag Warnings

```bash
# Replace deprecated --env with --environment
pcf-helper-run deploy -p . --environment "Production"
```

### Debug Information

```bash
# Show detailed version and environment information
pcf-helper-run --version --verbose

# Get help for specific command
pcf-helper-run deploy --help
```

## 📚 Additional Resources

### Documentation Links

- [Power Platform Component Framework Documentation](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/overview)
- [Power Platform CLI Documentation](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
- [PCF Community Gallery](https://pcf.gallery/)

## 🔗 Related Packages

- **[@tywalk/pcf-helper](../pcf-helper/README.md)** - Individual CLI commands and core library
- **[@tywalk/color-logger](https://www.npmjs.com/package/@tywalk/color-logger)** - Enhanced logging utilities

---

## 🏠 [← Back to Main Package](../../README.md)

For questions, feature requests, or bug reports, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.

**Happy PCF development! 🎉**
