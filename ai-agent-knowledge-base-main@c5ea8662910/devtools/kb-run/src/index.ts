#!/usr/bin/env node

/**
 * kb-run CLI - Knowledge Base Runner
 * 
 * Main entry point for the CLI application.
 * Uses commander.js for multi-command structure.
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerBuildCommand } from './commands/build.js';
import { registerStartCommand } from './commands/start.js';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Create commander program
const program = new Command();

// Configure program metadata
program
  .name('kb-run')
  .description('Knowledge Base Runner - Build and run KB skills and agents')
  .version(packageJson.version);

// Custom help for root command only (don't cascade to subcommands)
program.helpInformation = function() {
  const version = packageJson.version;
  return `Usage: kb-run [options] [command]

Knowledge Base Runner v${version} - Build and run KB skills and agents

Commands:
  build   Scaffold a KB agent context directory (skills, prompts, config)
  start   Build + launch IDE in one step (recommended for daily use)

Quick Start:
  $ kb-run start                                           # Interactive mode
  $ kb-run start --context=prod --agent=dt-dt-main-agent   # Build & launch OpenCode

Common Options (both commands):
  --context <name>         dtctl context / Dynatrace tenant         [required]
  --agent <name>           agent identifier                         [required]
  --package <name>         built-in package (default: dt-knowledge-base-all)
  --package-file <path>    custom package file (mutually exclusive with --package)
  --output <path>          output dir (default: /tmp/kb-run/<context>/<agent>)
  --target <type>          IDE: opencode | copilot | claude | vscode | windsurf
  --runtime <name>         runtime: system-bash | py-bash | dt-mcp-server
  --base-prompt <path>     system prompt file (default: SingleTenantPrompt.md)
  --update-mode <mode>     existing dir: replace | prompt | skip | fail
  --kb-root <path>         knowledge base root (auto-detected)
  --py-bash <path>         py-bash repo override (only with --runtime=py-bash)
  --non-interactive        disable interactive prompts

Start-only Options:
  --mode <type>            launch mode: tui | web | detached (default: tui)

Global Options:
  -V, --version            output the version number
  -h, --help               display help for command

Run 'kb-run <command> --help' for full details and examples.
`;
};

// Register subcommands
registerBuildCommand(program);
registerStartCommand(program);

// Parse command line arguments
program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
