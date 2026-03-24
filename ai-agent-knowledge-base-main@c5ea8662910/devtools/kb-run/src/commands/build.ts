/**
 * Build command implementation for kb-run
 * 
 * This command scaffolds a Knowledge Base agent context directory by:
 * 1. Validating dtctl context and package file
 * 2. Reading ai.package.yaml to get skills/resources
 * 3. Copying skill files to output directory
 * 4. Generating target-specific config and prompts
 * 
 * Usage: kb-run build --context=<name> --agent=<name> --package=<path> [options]
 */

import { Command } from 'commander';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import chalk from 'chalk';
import { DEFAULT_BASE_PROMPT } from '../types.js';
import type { BuildOptions, UpdateMode } from '../types.js';
import { scaffold } from '../scaffold.js';
import {
  resolveCommandOptions,
  resolvePackagePath,
  resolveUserBasePrompt,
  validateExplicitCommonFlags,
} from '../validate.js';
import { runInteractiveMode } from '../interactive.js';
import { buildCommandString } from '../command-builder.js';

/**
 * Registers the build command with commander
 * 
 * @param program - Commander program instance
 */
export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Scaffold a Knowledge Base agent context directory')
    .option('--context <name>', 'dtctl context name')
    .option('--agent <name>', 'agent identifier')
    .option('--package <name>', 'built-in package name (default: dt-knowledge-base-all)')
    .option('--package-file <path>', 'path to custom package file')
    .option('--output <path>', 'output directory (default: /tmp/kb-run/<context>/<agent>)')
    .option('--target <type>', 'target IDE: opencode, copilot, claude, vscode, or windsurf')
    .option('--runtime <name>', 'runtime: system-bash, py-bash, or dt-mcp-server', 'system-bash')
    .option('--update-mode <mode>', 'how to handle existing directory: replace, prompt, skip, or fail', 'replace')
    .option('--non-interactive', 'disable interactive mode', false)
    .option('--py-bash <path>', 'optional py-bash repo path override (used with --runtime=py-bash)')
    .option(
      '--base-prompt <path>',
      'base prompt file',
      DEFAULT_BASE_PROMPT
    )
    .option('--kb-root <path>', 'path to knowledge base root directory (auto-detected by default)')
    .addHelpText('after', `
Examples:
  # Interactive mode (prompts for all options)
  $ kb-run build
  
  # Use default built-in package (dt-knowledge-base-all) - always replaces existing
  $ kb-run build --context=abc12345 --agent=monitor
  
  # Use specific built-in package
  $ kb-run build --context=prod-eu --agent=log-analyzer --package=dt-knowledge-base-all
  
  # Use custom package file
  $ kb-run build --context=dev --agent=app-monitor --package-file=./monitoring.yaml
  
  # Use explicit knowledge base path
  $ kb-run build --kb-root /path/to/ai-agent-knowledge-base/knowledge-base --context=abc --agent=monitor
  
  # Use auto-detection (default)
  $ kb-run build --context=abc --agent=monitor
  
  # With different update modes
  $ kb-run build --context=test --agent=sre --package=dt-knowledge-base-all --update-mode=prompt
  $ kb-run build --context=test --agent=sre --package=dt-knowledge-base-all --update-mode=skip

  # Explicit runtime selection (default is system-bash):
  $ kb-run build --runtime=system-bash --context=prod --agent=plan --target=opencode

  # py-bash runtime with explicit path override:
  $ kb-run build --runtime=py-bash --py-bash ~/dev/dt-mcp-servers --context=prod --agent=plan --target=opencode

Description:
  The build command creates a complete agent context directory with:
  - All skills and resources from the package file
  - Base system prompt
  - Target-specific configuration and prompts
  - Directory structure ready for agent deployment
  - Target-specific configuration (e.g., opencode.json for OpenCode)

Interactive Mode:
  When required arguments are not provided, interactive mode automatically starts
  and prompts for package, tenant (dtctl context), agent, target IDE, and runtime.
  
  Use --non-interactive flag to disable interactive mode and require all arguments.

Required Arguments (unless using interactive mode):
  --context <name>   dtctl context name (identifies the Dynatrace environment)
  --agent <name>     agent identifier (used for output directory naming)

Package Selection (choose one):
  --package <name>        built-in package name from packages/ directory (default: dt-knowledge-base-all)
  --package-file <path>   path to custom ai.package.yaml file
  
  Note: Cannot specify both --package and --package-file

Optional Arguments:
  --output <path>          output directory (defaults to /tmp/kb-run/<context>/<agent>)
   --target <type>          target IDE: opencode, copilot, claude, vscode, or windsurf (default: opencode)
   --runtime <name>         runtime: system-bash | py-bash | dt-mcp-server (default: system-bash)
   --update-mode <mode>     how to handle existing directory (default: replace)
                           - replace: delete and recreate (always get latest)
                           - prompt: ask before overwriting
                           - skip: reuse existing directory
                           - fail: error if directory exists
  --non-interactive        disable interactive mode (require all arguments)
  --base-prompt            base prompt file (defaults to system-prompt/SingleTenantPrompt.md)
   --py-bash <path>         optional py-bash repo path override (used with --runtime=py-bash)
`)
    .action(async (options) => {
      try {
        await executeBuildCommand(options);
      } catch (error) {
        console.error(chalk.red('\n❌ Error: ' + (error instanceof Error ? error.message : String(error)) + '\n'));
        process.exit(1);
      }
    });
}

/**
 * Execute the build command
 * 
 * @param rawOptions - Raw options from commander
 */
async function executeBuildCommand(rawOptions: Record<string, unknown>): Promise<void> {
  validateExplicitCommonFlags(rawOptions);

  // Check if we need interactive mode
  const needsInteractive = !rawOptions.context || !rawOptions.agent;
  const nonInteractive = rawOptions.nonInteractive as boolean;
  
  // If missing required arguments and non-interactive mode, throw error
  if (needsInteractive && nonInteractive) {
    throw new Error('Missing required arguments: --context and --agent are required in non-interactive mode');
  }
  
  const resolved = await resolveCommandOptions({
    rawOptions,
    needsInteractive,
    runInteractive: async (kbRoot) =>
      runInteractiveMode({
        package: rawOptions.package as string | undefined,
        packageFile: rawOptions.packageFile as string | undefined,
        context: rawOptions.context as string | undefined,
        agent: rawOptions.agent as string | undefined,
        target: rawOptions.target as string | undefined,
        runtime: rawOptions.runtime as BuildOptions['runtime'] | undefined,
        kbRoot,
      }),
  });

  const { context, agent, target, runtime, updateMode, options, usedInteractive, kbRoot } = resolved;

  // Resolve package path from --package or --package-file
  const packageName = options.package as string | undefined;
  const packageFile = options.packageFile as string | undefined;
  const resolvedPackagePath = await resolvePackagePath(packageName, packageFile);

  const resolvedBasePrompt = resolveUserBasePrompt(options);

  // Build options object with resolved paths
  const buildOptions: BuildOptions = {
    context,
    agent,
    packageFile: resolvedPackagePath,
    output: options.output 
      ? resolve(options.output as string) 
      : join('/tmp', 'kb-run', context, agent),
    updateMode: updateMode as UpdateMode,
    basePrompt: resolvedBasePrompt,
    target,
    runtime,
    pyBashPath: options.pyBash ? resolve(options.pyBash as string) : undefined,
    kbRoot,
  };

  // If interactive mode was used, show the equivalent command
  if (usedInteractive) {
    const commandString = buildCommandString({
      command: 'build',
      context,
      agent,
      package: packageName,
      packageFile: options.packageFile as string | undefined,
      output: options.output as string | undefined,
      target,
      runtime,
      updateMode: updateMode as UpdateMode,
      basePrompt: resolvedBasePrompt ? options.basePrompt as string : undefined,
      pyBashPath: options.pyBash ? resolve(options.pyBash as string) : undefined,
    });
    
    console.log(chalk.cyan('💡 Equivalent command:\n'));
    console.log(chalk.white(`   ${commandString}\n`));
  }

  // Log what we're about to do
  console.log('Building agent context with options:');
  console.log(`  Context: ${buildOptions.context}`);
  console.log(`  Agent: ${buildOptions.agent}`);
  console.log(`  Target: ${buildOptions.target}`);
  console.log(`  Package: ${buildOptions.packageFile}`);
  console.log(`  Runtime: ${buildOptions.runtime}`);
  console.log(`  Output: ${buildOptions.output}`);
  console.log(`  Update Mode: ${buildOptions.updateMode}`);
  console.log(`  Base Prompt: ${buildOptions.basePrompt || `${DEFAULT_BASE_PROMPT} (default)`}`);
  console.log('');

  // Call scaffold function
  await scaffold(buildOptions);
}
