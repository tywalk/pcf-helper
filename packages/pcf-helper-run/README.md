# PCF Helper Run

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
