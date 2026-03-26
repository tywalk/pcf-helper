# PCF Helper 🚀

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helpers.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helpers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Command-line tools for **Power Platform Component Framework (PCF)** development, providing streamlined utilities to initialize, build, deploy, and manage your PCF controls in Dataverse environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Packages](#packages)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Testing](#testing)

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
- **Microsoft Power Platform CLI (`pac`)** - [Installation Guide](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)
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

- [Power Platform Component Framework Documentation](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/)
- [Power Platform CLI Documentation](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)
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

[![npm version](https://badge.fury.io/js/%40tywalk%2Fpcf-helpers.svg)](https://badge.fury.io/js/%40tywalk%2Fpcf-helpers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive toolkit for **Power Platform Component Framework (PCF)** development, providing streamlined command-line tools to initialize, build, deploy, and manage your PCF controls in Dataverse environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Packages](#packages)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Overview

PCF Helper simplifies the PCF development workflow by automating common tasks such as project initialization, building, importing, and deploying PCF controls. Whether you're a seasoned PCF developer or just getting started, these tools will accelerate your development process.

## ✨ Features

- **🏗️ Project Initialization**: Quickly scaffold new PCF projects with proper structure
- **⚡ Fast Build Process**: Streamlined building of PCF controls with TypeScript compilation
- **🚀 Automated Deployment**: Deploy controls directly to your Dataverse environment
- **📦 Solution Management**: Import and manage PCF controls in your solutions
- **🔄 Upgrade Automation**: Keep your PCF projects up-to-date with latest dependencies
- **🎯 Session Management**: Handle authentication sessions for seamless deployments
- **📊 Verbose Logging**: Detailed output for debugging and monitoring
- **⚙️ Flexible Configuration**: Customizable timeouts and environment settings

## 📦 Packages

This monorepo contains two complementary packages:

| Package | Description | NPM Link |
|---------|-------------|----------|
| **[@tywalk/pcf-helper](./packages/pcf-helper/)** | Core library with individual CLI commands for each PCF operation | [![npm](https://img.shields.io/npm/v/@tywalk/pcf-helper.svg)](https://www.npmjs.com/package/@tywalk/pcf-helper) |
| **[@tywalk/pcf-helper-run](./packages/pcf-helper-run/)** | Unified CLI interface that consolidates all PCF operations | [![npm](https://img.shields.io/npm/v/@tywalk/pcf-helper-run.svg)](https://www.npmjs.com/package/@tywalk/pcf-helper-run) |

### Package Comparison

- **Use `@tywalk/pcf-helper`** if you need individual commands or want to integrate specific functions into your workflow
- **Use `@tywalk/pcf-helper-run`** for a unified CLI experience with all commands accessible through a single interface

## 🔧 Requirements

Before using PCF Helper tools, ensure you have the following installed:

### Required Dependencies

- **Node.js** (version 16.x or higher)
- **Microsoft Power Platform CLI (`pac`)** - [Installation Guide](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)
- **.NET SDK** or **Visual Studio** - [Download .NET](https://dotnet.microsoft.com/download)

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

### 1. Choose Your Package

**Option A: Individual Commands (Recommended for CI/CD)**

```bash
npm install -g @tywalk/pcf-helper
```

**Option B: Unified Interface (Recommended for Development)**

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

Detailed documentation for each package:

- **[PCF Helper Core](./packages/pcf-helper/README.md)** - Individual CLI commands and API reference
- **[PCF Helper Run](./packages/pcf-helper-run/README.md)** - Unified CLI interface and usage examples

### External Resources

- [Power Platform Component Framework Documentation](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/)
- [Power Platform CLI Documentation](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/powerapps-cli)
- [PCF Gallery - Community Controls](https://pcf.gallery/)

## 🧪 Testing

The project uses **Jest** for comprehensive testing coverage.

### Run Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/pcf-helper && npm test
cd packages/pcf-helper-run && npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- Unit tests for individual commands
- Integration tests for CLI interfaces
- End-to-end tests for complete workflows

## 🏗️ Development

### Project Structure

```
pcf-helper/
├── packages/
│   ├── pcf-helper/           # Core library
│   │   ├── bin/             # CLI executables
│   │   ├── tasks/           # Core functionality
│   │   ├── __tests__/       # Unit tests
│   │   └── types/           # TypeScript definitions
│   └── pcf-helper-run/      # Unified CLI
│       ├── util/            # Utility functions
│       └── __tests__/       # Tests
├── package.json             # Root package configuration
└── README.md               # This file
```

### Build from Source

```bash
# Clone the repository
git clone https://github.com/tywalk/pcf-helper.git
cd pcf-helper

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Microsoft Power Platform team for the excellent PCF framework
- The Power Platform community for feedback and contributions
- All contributors who have helped improve these tools

---

**Made with ❤️ for the Power Platform community**

For questions, issues, or feature requests, please visit our [GitHub Issues](https://github.com/tywalk/pcf-helper/issues) page.
