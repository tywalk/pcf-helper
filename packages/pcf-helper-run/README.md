# PCF Helper Run 🎯

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helper-run.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helper-run)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Unified CLI interface for all Power Platform Component Framework (PCF) operations.**

This package provides a single, consolidated command-line interface that brings together all PCF Helper functionality under one roof. Perfect for developers who prefer a unified experience and simplified command structure.

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Command Structure](#command-structure)
- [Available Subcommands](#available-subcommands)
- [Usage Examples](#usage-examples)
- [Global Options](#global-options)
- [Troubleshooting](#troubleshooting)

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

#### Examples

```bash
# Start session with default config
pcf-helper-run session

# Session with custom configuration
pcf-helper-run session -u "https://contoso.crm.dynamics.com" -s ./bundle.js
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
pcf-helper-run build -p . --timeout 600000  # 10 minutes
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
- [Power Platform Component Framework Documentation](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/)
- [Power Platform CLI Documentation](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)
- [PCF Community Gallery](https://pcf.gallery/)

## 🔗 Related Packages

- **[@tywalk/pcf-helper](../pcf-helper/README.md)** - Individual CLI commands and core library
- **[@tywalk/color-logger](https://www.npmjs.com/package/@tywalk/color-logger)** - Enhanced logging utilities

---

## 🏠 [← Back to Main Package](../../README.md)

For questions, feature requests, or bug reports, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.

**Happy PCF development! 🎉**

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helper-run.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helper-run)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Unified CLI interface for all Power Platform Component Framework (PCF) operations.**

This package provides a single, consolidated command-line interface that brings together all PCF Helper functionality under one roof. Perfect for developers who prefer a unified experience and simplified command structure.

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Command Structure](#command-structure)
- [Available Subcommands](#available-subcommands)
- [Usage Examples](#usage-examples)
- [Global Options](#global-options)
- [Configuration](#configuration)
- [Workflow Examples](#workflow-examples)
- [Troubleshooting](#troubleshooting)
- [Back to Main Package](#back-to-main-package)

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @tywalk/pcf-helper-run
```

### Local Installation

```bash
npm install @tywalk/pcf-helper-run
# or
yarn add @tywalk/pcf-helper-run
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
| `deploy` | Deploy to environment | `pcf-helper-deploy` |
| `upgrade` | Upgrade project dependencies | `pcf-helper-upgrade` |
| `session` | Manage authentication sessions | `pcf-helper-session` |

## 📖 Detailed Command Reference

### 🏗️ init - Initialize New Project

Create a new PCF project with proper scaffolding.

```bash
pcf-helper-run init -n <control-name> [options]
```

#### Required Parameters
- `-n, --name <name>` - Name of the PCF control

#### Optional Parameters
- `--publisher-name <name>` - Publisher name (default: "Default Publisher")
- `--publisher-prefix <prefix>` - Publisher prefix (default: "dp")
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
- `--env <environment>` - Target environment (deprecated: use `--environment`)
- `--environment <environment>` - Target environment configuration
- `-t, --timeout <milliseconds>` - Build timeout (default: 60000)

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
- `--environment <environment>` - Target environment
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

Deploy your PCF controls to the target Dataverse environment.

```bash
pcf-helper-run deploy -p <solution-path> [options]
```

#### Required Parameters
- `-p, --path <path>` - Path to the solution folder

#### Optional Parameters
- `--environment <environment>` - Target environment for deployment
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

### 🎯 session - Manage Authentication

Manage authentication sessions for Dataverse connections.

```bash
pcf-helper-run session --url <dataverse-url> [options]
```

#### Required Parameters
- `--url <url>` - Dataverse environment URL

#### Optional Parameters
- `--script <path>` - Path to custom authentication script
- `--stylesheet <path>` - Path to custom stylesheet for auth UI

#### Examples

```bash
# Establish session with environment
pcf-helper-run session --url "https://contoso.crm.dynamics.com"

# Session with custom authentication script
pcf-helper-run session --url "https://contoso.crm.dynamics.com" --script ./auth.js
```

## ⚙️ Global Options

These options are available for all subcommands:

| Option | Description | Default |
|--------|-------------|----------|
| `-V, --verbose` | Enable detailed logging | `false` |
| `-v, --version` | Display version information | - |
| `-h, --help` | Show help for command | - |
| `-t, --timeout <ms>` | Operation timeout in milliseconds | `60000` |

### Global Usage Examples

```bash
# Enable verbose logging for any command
pcf-helper-run build -p . --verbose

# Set custom timeout
pcf-helper-run import -p . --timeout 120000

# Get help for specific subcommand
pcf-helper-run build --help
```

## 🔧 Configuration

### Environment Variables

Configure default behavior with environment variables:

```bash
# Set default timeout
export PCF_HELPER_TIMEOUT=120000

# Enable verbose mode by default
export PCF_HELPER_VERBOSE=true

# Set default publisher information
export PCF_HELPER_PUBLISHER_NAME="My Corporation"
export PCF_HELPER_PUBLISHER_PREFIX="mc"
```

### Configuration File

Create `pcf-helper-run.config.json` in your project:

```json
{
  "defaults": {
    "timeout": 120000,
    "verbose": false,
    "publisherName": "My Corporation",
    "publisherPrefix": "mc"
  },
  "environments": {
    "dev": "https://dev.crm.dynamics.com",
    "test": "https://test.crm.dynamics.com",
    "prod": "https://prod.crm.dynamics.com"
  }
}
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
pcf-helper-run session --url "https://dev.crm.dynamics.com"
pcf-helper-run deploy -p . --environment "Development"

# After testing, deploy to staging
pcf-helper-run session --url "https://staging.crm.dynamics.com"
pcf-helper-run deploy -p . --environment "Staging"

# Finally, deploy to production
pcf-helper-run session --url "https://prod.crm.dynamics.com"
pcf-helper-run deploy -p . --environment "Production"
```

### Batch Operations

```bash
#!/bin/bash
# Build and deploy multiple controls

CONTROLS=("FieldValidator" "DataGrid" "Chart")

for control in "${CONTROLS[@]}"; do
  echo "Processing $control..."
  
  cd "./controls/$control"
  
  pcf-helper-run build -p . --verbose
  pcf-helper-run import -p . --timeout 180000
  pcf-helper-run deploy -p . --environment "Production"
  
  cd ../..
  
  echo "✅ $control completed"
done

echo "🎉 All controls deployed successfully!"
```

### CI/CD Integration

```yaml
# GitHub Actions Workflow
name: PCF Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install PCF Helper Run
      run: npm install -g @tywalk/pcf-helper-run
    
    - name: Build PCF Controls
      run: |
        pcf-helper-run build -p ./src/controls/ --verbose --timeout 180000
    
    - name: Deploy to Test (PR only)
      if: github.event_name == 'pull_request'
      run: |
        pcf-helper-run session --url ${{ secrets.TEST_ENV_URL }}
        pcf-helper-run deploy -p ./src/controls/ --environment "Test"
    
    - name: Deploy to Production (main branch)
      if: github.ref == 'refs/heads/main'
      run: |
        pcf-helper-run session --url ${{ secrets.PROD_ENV_URL }}
        pcf-helper-run deploy -p ./src/controls/ --environment "Production"
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

#### Authentication Issues

```bash
# Clear existing authentication
pac auth clear

# Re-establish session
pcf-helper-run session --url "https://your-environment.crm.dynamics.com"

# List current authentication profiles
pac auth list
```

#### Timeout Errors

```bash
# Increase timeout for large projects
pcf-helper-run build -p . --timeout 300000  # 5 minutes

# Or set via environment variable
export PCF_HELPER_TIMEOUT=300000
pcf-helper-run build -p .
```

### Debug Information

```bash
# Show detailed version and environment information
pcf-helper-run --version --verbose

# Enable debug mode for maximum logging
export DEBUG=pcf-helper:*
pcf-helper-run build -p . --verbose
```

### Performance Tips

1. **Use appropriate timeouts**: Set realistic timeouts based on project size
2. **Enable verbose mode**: Only when debugging to avoid log overhead
3. **Batch operations**: Group related operations to minimize authentication overhead
4. **Environment management**: Use session management for multiple deployments

## 📚 Additional Resources

### Documentation Links
- [Power Platform Component Framework Documentation](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/)
- [Power Platform CLI Documentation](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)
- [PCF Samples Repository](https://github.com/microsoft/PowerApps-Samples/tree/master/component-framework)
- [PCF Community Gallery](https://pcf.gallery/)

### Tutorials and Guides
- [Getting Started with PCF](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/overview)
- [PCF Control Deployment](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/import-custom-controls)
- [Advanced PCF Techniques](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/code-components-best-practices)

## 🔗 Related Packages

- **[@tywalk/pcf-helper](../pcf-helper/README.md)** - Individual CLI commands and core library
- **[@tywalk/color-logger](https://www.npmjs.com/package/@tywalk/color-logger)** - Enhanced logging utilities
- **[commander](https://www.npmjs.com/package/commander)** - Command-line interface framework

## ⚡ Performance Comparison

| Operation | Individual Commands | PCF Helper Run | Advantage |
|-----------|-------------------|----------------|----------|
| Single Operation | ✅ Direct | ✅ Unified Interface | Simplified syntax |
| Multiple Operations | Multiple commands | Single interface | Consistent experience |
| CI/CD Integration | Multiple installs | Single install | Reduced complexity |
| Learning Curve | Higher | Lower | Unified command structure |
| Memory Usage | Lower per command | Slightly higher | Acceptable trade-off |

---

## 🏠 [← Back to Main Package](../../README.md)

For questions, feature requests, or bug reports, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.

**Happy PCF development! 🎉**

A simple command-line utility for building and publishing PCF controls to Dataverse.

## Requirements

This tool requires the following:

* `pac` cli installed on your machine.
* `dotnet` cli or Visual Studio installed on your machine.

## Instructions

1. In a terminal, install globally `npm install --save --global @tywalk/pcf-helper-run`. Or,
2. In a terminal, run `npx @tywalk/pcf-helper-run [command] --path <path to pcf project folder> --environment <environment guid or url>`.

### Commands

* `upgrade` - Upgrades PCF manifest and solution versions (--environment is not required). `npx @tywalk/pcf-helper-run upgrade --path <path to pcf project folder>`
* `build` - Builds PCF control (--environment is not required). `npx @tywalk/pcf-helper-run build --path <path to pcf project folder>`
* `import` - Imports PCF control into specified environment. Defaults to auth profile environment. `npx @tywalk/pcf-helper-run import --path <path to pcf project folder> --environment <environment guid or url>`
* `deploy` - Upgrades, builds, and imports PCF control. `npx @tywalk/pcf-helper-run deploy--path <path to pcf project folder> --environment <environment guid or url>`
