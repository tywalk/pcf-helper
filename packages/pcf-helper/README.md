# PCF Helper

A simple command-line tool that upgrades, builds, and imports your PCF control into your Dataverse environment.

You can run commands separately or run `pcf-helper-deploy` to upgrade, build, and import with just one command.

## Requirements

This tool requires the following:

* `pac` cli installed on your machine.
* `dotnet` cli or Visual Studio installed on your machine.

## Instructions

1. In your project, run `npm install --save @tywalk/pcf-helper`. Or, install globally `npm install --save --global @tywalk/pcf-helper`.
2. In your project's `package.json` file, add commands as npm scripts:

```json
"scripts": {
  "upgrade": "pcf-helper-upgrade --path <path to pcf project folder>",
  "build": "pcf-helper-build --path <path to pcf project folder>",
  "import": "pcf-helper-import --path <path to pcf project folder> --environment <environment guid or url>",
  "deploy": "pcf-helper-deploy --path <path to pcf project folder> --environment <environment guid or url>"
},
```
