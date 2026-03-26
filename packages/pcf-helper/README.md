# PCF Helper Core 🔧

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helper.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helper)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Individual CLI commands and core library for Power Platform Component Framework (PCF) development.**

This package provides discrete command-line utilities for each PCF operation, making it ideal for automation scripts and developers who prefer granular control over their PCF workflows.

## 📋 Table of Contents

- [Installation](#installation)
- [Available Commands](#available-commands)
- [Command Reference](#command-reference)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @tywalk/pcf-helper
```

### Local Installation

```bash
npm install @tywalk/pcf-helper
```

## 🛠️ Available Commands

Each command is available as a standalone executable:

| Command | Purpose | Global Usage |
|---------|---------|--------------|
| `pcf-helper-init` | Initialize new PCF project | `pcf-helper-init [options]` |
| `pcf-helper-build` | Build PCF controls | `pcf-helper-build [options]` |
| `pcf-helper-import` | Import controls to solution | `pcf-helper-import [options]` |
| `pcf-helper-deploy` | Deploy controls (upgrade + build + import) | `pcf-helper-deploy [options]` |
| `pcf-helper-upgrade` | Upgrade project dependencies | `pcf-helper-upgrade [options]` |
| `pcf-helper-session` | Manage development sessions | `pcf-helper-session [options]` |

## 📖 Command Reference

### 🏗️ pcf-helper-init

Initialize a new PCF project with proper scaffolding.

```bash
pcf-helper-init -n <control-name> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `-n, --name <name>` | Name of the PCF control | ✅ | - |
| `--publisher-name <name>` | Publisher name for the control | ❌ | - |
| `--publisher-prefix <prefix>` | Publisher prefix | ❌ | - |
| `-p, --path <path>` | Path to create the project | ❌ | Current directory |
| `--run-npm-install` | Run npm install after init | ❌ | `true` |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

#### Example

```bash
# Basic initialization
pcf-helper-init -n MyCustomControl

# Full initialization with custom settings
pcf-helper-init -n MyCustomControl \
  --publisher-name "Contoso" \
  --publisher-prefix "con" \
  -p ./my-pcf-project \
  --verbose
```

### ⚡ pcf-helper-build

Build and compile your PCF controls.

```bash
pcf-helper-build -p <solution-path> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `-p, --path <path>` | Path to solution folder | ✅ | - |
| `-t, --timeout <ms>` | Timeout in milliseconds | ❌ | 300000 |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

#### Example

```bash
# Build with default settings
pcf-helper-build -p ./MySolution

# Build with custom timeout and verbose output
pcf-helper-build -p ./MySolution --timeout 120000 --verbose
```

### 📦 pcf-helper-import

Import PCF controls into your Dataverse solution.

```bash
pcf-helper-import -p <solution-path> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `-p, --path <path>` | Path to solution folder | ✅ | - |
| `-e, --environment <environment>` | Target environment | ❌ | - |
| `-t, --timeout <ms>` | Timeout in milliseconds | ❌ | 300000 |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

### 🚀 pcf-helper-deploy

Deploy your PCF controls to the target environment. This command runs upgrade, build, and import in sequence.

```bash
pcf-helper-deploy -p <solution-path> [options]
```

#### Options

Same as pcf-helper-import, but runs the full deployment pipeline.

### 🔄 pcf-helper-upgrade

Upgrade project dependencies and framework versions.

```bash
pcf-helper-upgrade -p <solution-path> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `-p, --path <path>` | Path to solution folder | ✅ | - |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

### 🎯 pcf-helper-session

Manage development sessions with live reloading capabilities.

```bash
pcf-helper-session [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `-u, --url <url>` | Remote environment URL | ❌ | - |
| `-s, --script <path>` | Remote script to intercept | ❌ | - |
| `-t, --stylesheet <path>` | Remote stylesheet to intercept | ❌ | - |
| `-b, --bundle <path>` | Local bundle path | ❌ | - |
| `-c, --css <path>` | Local CSS path | ❌ | - |
| `-f, --config <path>` | Config file path | ❌ | `session.config.json` |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

## 🔧 API Reference

You can also use PCF Helper programmatically in your Node.js applications:

```typescript
import * as pcfHelper from '@tywalk/pcf-helper';

// Build a PCF control
const result = pcfHelper.runBuild('./my-solution', true, 120000);

// Initialize a new project
const initResult = pcfHelper.runInit(
  './new-project',
  'MyControl',
  'My Publisher',
  'mp',
  true,
  true
);

// Set logging level
pcfHelper.setLogLevel('debug');
```

### Available Functions

- `runBuild(path, verbose, timeout?)` - Build PCF controls
- `runInit(path, name, publisherName, publisherPrefix, runNpmInstall, verbose)` - Initialize new PCF project
- `runImport(path, environment, verbose, timeout?)` - Import controls to solution
- `runUpgrade(path, verbose)` - Upgrade project
- `runSession(...)` - Manage development sessions
- `setLogLevel(level)` - Set logging verbosity ('debug' | 'info' | 'warn' | 'error')

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Enable verbose logging for detailed error information
pcf-helper-build -p . --verbose

# Check if PAC CLI is properly installed
pac --version

# Verify .NET SDK installation
dotnet --version
```

#### Timeout Errors

```bash
# Increase timeout for large projects
pcf-helper-build -p . --timeout 600000  # 10 minutes
```

### Getting Help

```bash
# Show help for any command
pcf-helper-build --help
pcf-helper-init --help

# Show version
pcf-helper-build --version
```

## 📚 Additional Resources

- [Power Platform Component Framework Documentation](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/)
- [Power Platform CLI Reference](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)

## 🔗 Related Packages

- **[@tywalk/pcf-helper-run](../pcf-helper-run/README.md)** - Unified CLI interface
- **[@tywalk/color-logger](https://www.npmjs.com/package/@tywalk/color-logger)** - Enhanced logging utilities

---

## 🏠 [← Back to Main Package](../../README.md)

For questions or issues, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helper.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helper)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Individual CLI commands and core library for Power Platform Component Framework (PCF) development.**

This package provides discrete command-line utilities for each PCF operation, making it ideal for CI/CD pipelines, automation scripts, and developers who prefer granular control over their PCF workflows.

## 📋 Table of Contents

- [Installation](#installation)
- [Available Commands](#available-commands)
- [Command Reference](#command-reference)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Back to Main Package](#back-to-main-package)

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @tywalk/pcf-helper
```

### Local Installation

```bash
npm install @tywalk/pcf-helper
# or
yarn add @tywalk/pcf-helper
```

### As Development Dependency

```bash
npm install --save-dev @tywalk/pcf-helper
```

## 🛠️ Available Commands

Each command is available as a standalone executable:

| Command | Purpose | Global Usage |
|---------|---------|---------------|
| `pcf-helper-init` | Initialize new PCF project | `pcf-helper-init [options]` |
| `pcf-helper-build` | Build PCF controls | `pcf-helper-build [options]` |
| `pcf-helper-import` | Import controls to solution | `pcf-helper-import [options]` |
| `pcf-helper-deploy` | Deploy controls to environment | `pcf-helper-deploy [options]` |
| `pcf-helper-upgrade` | Upgrade project dependencies | `pcf-helper-upgrade [options]` |
| `pcf-helper-session` | Manage authentication sessions | `pcf-helper-session [options]` |

## 📖 Command Reference

### 🏗️ pcf-helper-init

Initialize a new PCF project with proper scaffolding.

```bash
pcf-helper-init -n <control-name> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|----------|
| `-n, --name <name>` | Name of the PCF control | ✅ | - |
| `--publisher-name <name>` | Publisher name for the control | ❌ | Default Publisher |
| `--publisher-prefix <prefix>` | Publisher prefix | ❌ | dp |
| `-p, --path <path>` | Path to create the project | ❌ | Current directory |
| `--run-npm-install` | Run npm install after init | ❌ | `true` |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

#### Example

```bash
# Basic initialization
pcf-helper-init -n MyCustomControl

# Full initialization with custom settings
pcf-helper-init -n MyCustomControl \
  --publisher-name "Contoso" \
  --publisher-prefix "con" \
  -p ./my-pcf-project \
  --verbose
```

### ⚡ pcf-helper-build

Build and compile your PCF controls.

```bash
pcf-helper-build -p <solution-path> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|----------|
| `-p, --path <path>` | Path to solution folder | ✅ | - |
| `-t, --timeout <ms>` | Timeout in milliseconds | ❌ | 60000 |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

#### Example

```bash
# Build with default timeout
pcf-helper-build -p ./MySolution

# Build with custom timeout and verbose output
pcf-helper-build -p ./MySolution --timeout 120000 --verbose
```

### 📦 pcf-helper-import

Import PCF controls into your Dataverse solution.

```bash
pcf-helper-import -p <solution-path> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|----------|
| `-p, --path <path>` | Path to solution folder | ✅ | - |
| `-t, --timeout <ms>` | Timeout in milliseconds | ❌ | 60000 |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

### 🚀 pcf-helper-deploy

Deploy your PCF controls to the target environment.

```bash
pcf-helper-deploy -p <solution-path> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|----------|
| `-p, --path <path>` | Path to solution folder | ✅ | - |
| `-t, --timeout <ms>` | Timeout in milliseconds | ❌ | 60000 |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

### 🔄 pcf-helper-upgrade

Upgrade project dependencies and framework versions.

```bash
pcf-helper-upgrade -p <solution-path> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|----------|
| `-p, --path <path>` | Path to solution folder | ✅ | - |
| `-t, --timeout <ms>` | Timeout in milliseconds | ❌ | 60000 |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

### 🎯 pcf-helper-session

Open up development sessions to test without publishing.

```bash
pcf-helper-session --url <dataverse-url> [options]
```

#### Options

| Option | Description | Required | Default |
|--------|-------------|----------|----------|
| `--url <url>` | Dataverse environment URL | ✅ | - |
| `--script <path>` | Path to remote script | ❌ | - |
| `--stylesheet <path>` | Path to remote stylesheet | ❌ | - |
| `--bundle <path>` | Path to custom stylesheet | ❌ | - |
| `--css <path>` | Path to custom stylesheet | ❌ | - |
| `--config <path>` | Path to config file | ❌ | - |
| `-t, --timeout <ms>` | Timeout in milliseconds | ❌ | 60000 |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

## 💡 Usage Examples

### Complete PCF Development Workflow

```bash
# 1. Initialize a new project
pcf-helper-init -n "SalesCalculator" \
  --publisher-name "Contoso Sales" \
  --publisher-prefix "cs" \
  -p ./sales-calculator

# 2. Navigate to the project
cd ./sales-calculator

# 3. Build the control
pcf-helper-build -p . --verbose

# 4. Import to solution
pcf-helper-import -p . --timeout 120000

# 5. Deploy to environment
pcf-helper-deploy -p .
```

### Batch Operations

```bash
#!/bin/bash
# Build multiple controls
for control in ./controls/*/; do
  echo "Building $control"
  pcf-helper-build -p "$control" --verbose
done
```

## 🔧 API Reference

You can also use PCF Helper programmatically in your Node.js applications:

```typescript
import * as pcfHelper from '@tywalk/pcf-helper';

// Build a PCF control
await pcfHelper.buildPcf({
  path: './my-solution',
  verbose: true,
  timeout: 120000
});

// Initialize a new project
await pcfHelper.initPcf({
  name: 'MyControl',
  path: './new-project',
  publisherName: 'My Publisher',
  publisherPrefix: 'mp',
  runNpmInstall: true
});

// Set logging level
pcfHelper.setLogLevel('debug');
```

### Available Functions

- `buildPcf(options)` - Build PCF controls
- `initPcf(options)` - Initialize new PCF project
- `importPcf(options)` - Import controls to solution
- `deployPcf(options)` - Deploy to environment
- `upgradePcf(options)` - Upgrade project
- `sessionPcf(options)` - Manage sessions
- `setLogLevel(level)` - Set logging verbosity

## ⚙️ Configuration

### Environment Variables

You can configure default behavior using environment variables:

```bash
# Default timeout (milliseconds)
export PCF_HELPER_TIMEOUT=120000

# Default publisher settings
export PCF_HELPER_PUBLISHER_NAME="My Company"
export PCF_HELPER_PUBLISHER_PREFIX="mc"

# Enable verbose logging by default
export PCF_HELPER_VERBOSE=true
```

### Configuration File

Create a `pcf-helper.config.json` in your project root:

```json
{
  "defaultTimeout": 120000,
  "publisherName": "My Company",
  "publisherPrefix": "mc",
  "verbose": false,
  "buildOptions": {
    "parallel": true,
    "minify": true
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Enable verbose logging for detailed error information
pcf-helper-build -p . --verbose

# Check if PAC CLI is properly installed
pac --version

# Verify .NET SDK installation
dotnet --version
```

#### Authentication Issues

```bash
# Clear authentication cache
pac auth clear

# Re-establish session
pcf-helper-session --url https://your-environment.crm.dynamics.com
```

#### Timeout Errors

```bash
# Increase timeout for large projects
pcf-helper-build -p . --timeout 300000  # 5 minutes
```

### Debug Mode

Enable comprehensive logging:

```bash
# Enable debug logging for any command
pcf-helper-build -p . --verbose

# Or set environment variable
export DEBUG=pcf-helper:*
pcf-helper-build -p .
```

### Getting Help

```bash
# Show help for any command
pcf-helper-build --help
pcf-helper-init --help

# Show version
pcf-helper-build --version
```

## 📚 Additional Resources

- [Power Platform Component Framework Documentation](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/)
- [PCF Control Samples](https://github.com/microsoft/PowerApps-Samples/tree/master/component-framework)
- [Power Platform CLI Reference](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)
- [TypeScript PCF Controls](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/typescript-controls)

## 🔗 Related Packages

- **[@tywalk/pcf-helper-run](../pcf-helper-run/README.md)** - Unified CLI interface
- **[@tywalk/color-logger](https://www.npmjs.com/package/@tywalk/color-logger)** - Enhanced logging utilities

---

## 🏠 [← Back to Main Package](../../README.md)

For questions or issues, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.

A simple command-line tool that upgrades, builds, and imports your PCF control into your Dataverse environment.

You can run commands separately or run `pcf-helper-deploy` to upgrade, build, and import with just one command.

## Requirements

This tool requires the following:

- `pac` cli installed on your machine.
- `dotnet` cli or Visual Studio installed on your machine.

## Instructions

1. In your project, run `npm install --save @tywalk/pcf-helper`. Or, install globally `npm install --save --global @tywalk/pcf-helper`.
2. In your project's `package.json` file, add commands as npm scripts:

```json
"scripts": {
  "upgrade": "pcf-helper-upgrade --path <path to pcf project folder>",
  "build": "pcf-helper-build --path <path to pcf project folder>",
  "import": "pcf-helper-import --path <path to pcf project folder> --environment <environment guid or url>",
  "deploy": "pcf-helper-deploy --path <path to pcf project folder> --environment <environment guid or url>",
  "init": "pcf-helper-init --path <path to pcf project folder (optional)> --name <name of the pcf project> --publisher-name <powerapps publisher name> --publisher-prefix <powerapps publisher prefix>"
},
```

## Contributing

### Deployment
