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
| `-w, --watch` | Start pcf-scripts watch process | ❌ | `false` |
| `-V, --verbose` | Enable verbose logging | ❌ | `false` |
| `-v, --version` | Display version | ❌ | - |

## 🔧 API Reference
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

- [Power Platform Component Framework Documentation](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/overview)
- [Power Platform CLI Reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)

## 🔗 Related Packages

- **[@tywalk/pcf-helper-run](../pcf-helper-run/README.md)** - Unified CLI interface
- **[@tywalk/color-logger](https://www.npmjs.com/package/@tywalk/color-logger)** - Enhanced logging utilities

---

## 🏠 [← Back to Main Package](../../README.md)

For questions or issues, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.
