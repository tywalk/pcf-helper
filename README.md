# PCF Helper 🚀

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helpers.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helpers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pcf-helper CI](https://github.com/tywalk/pcf-helper/actions/workflows/npm-publish-pcf-helper.yml/badge.svg)](https://github.com/tywalk/pcf-helper/actions/workflows/npm-publish-pcf-helper.yml)
[![pcf-helper-run CI](https://github.com/tywalk/pcf-helper/actions/workflows/npm-publish-pcf-helper-run.yml/badge.svg)](https://github.com/tywalk/pcf-helper/actions/workflows/npm-publish-pcf-helper-run.yml)
[![codecov](https://codecov.io/gh/tywalk/pcf-helper/graph/badge.svg)](https://codecov.io/gh/tywalk/pcf-helper)

Command-line tools for **Power Platform Component Framework (PCF)** development, providing streamlined utilities to initialize, build, deploy, and manage your PCF controls in Dataverse environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Packages](#-packages)
- [Requirements](#-requirements)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Testing](#-testing)

## Overview

PCF Helper simplifies the PCF development workflow by automating common tasks such as project initialization, building, importing, and deploying PCF controls.

## ✨ Features

- **🏗️ Project Initialization**: Scaffold new PCF projects with proper structure
- **⚡ Fast Build Process**: Build PCF controls with TypeScript compilation
- **🚀 Automated Deployment**: Deploy controls to your Dataverse environment (runs upgrade + build + import)
- **📦 Solution Management**: Import PCF controls into your solutions
- **🔄 Upgrade Automation**: Keep your PCF projects up-to-date with latest dependencies
- **🎯 Session Management**: Handle development sessions with live reloading capabilities

## 📦 Packages

This monorepo contains two complementary packages:

| Package | Description | NPM Link |
|---------|-------------|----------|
| **[@tywalk/pcf-helper](./packages/pcf-helper/)** | Core library with individual CLI commands | [![npm](https://img.shields.io/npm/v/@tywalk/pcf-helper.svg)](https://www.npmjs.com/package/@tywalk/pcf-helper) |
| **[@tywalk/pcf-helper-run](./packages/pcf-helper-run/)** | Unified CLI interface | [![npm](https://img.shields.io/npm/v/@tywalk/pcf-helper-run.svg)](https://www.npmjs.com/package/@tywalk/pcf-helper-run) |

### Package Comparison

- **Use `@tywalk/pcf-helper`** for individual commands or integration into scripts
- **Use `@tywalk/pcf-helper-run`** for a unified CLI experience

## 🔧 Requirements

- **Node.js** (version 16.x or higher)
- **Microsoft Power Platform CLI (`pac`)** - [Installation Guide](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
- **.NET SDK** - [Download .NET](https://dotnet.microsoft.com/download)

### Verify Installation

```bash
# Check Node.js version
node --version

# Verify PAC CLI installation
pac --version

# Check .NET SDK
dotnet --version
```

## 🚀 Quick Start

### 1. Install a Package

**Individual Commands**
```bash
npm install -g @tywalk/pcf-helper
```

**Unified Interface**
```bash
npm install -g @tywalk/pcf-helper-run
```

### 2. Initialize a New PCF Project

```bash
# Using individual commands
pcf-helper-init -n MyControl --publisher-name "My Publisher" --publisher-prefix myprefix

# Using unified interface
pcf-helper-run init -n MyControl --publisher-name "My Publisher" --publisher-prefix myprefix
```

### 3. Build Your Control

```bash
# Navigate to your solution folder
cd path/to/your/solution

# Build the control
pcf-helper-build -p . 
# or
pcf-helper-run build -p .
```

## 📖 Documentation

- **[PCF Helper Core](./packages/pcf-helper/README.md)** - Individual CLI commands and API reference
- **[PCF Helper Run](./packages/pcf-helper-run/README.md)** - Unified CLI interface

### External Resources

- [Power Platform Component Framework Documentation](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/overview)
- [Power Platform CLI Documentation](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
- [PCF Gallery - Community Controls](https://pcf.gallery/)

## 🧪 Testing

The project uses **Jest** for testing:

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/pcf-helper && npm test
cd packages/pcf-helper-run && npm test
```

---

**Made with ❤️ for the Power Platform community**

For questions, issues, or feature requests, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.
