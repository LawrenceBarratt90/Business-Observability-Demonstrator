/**
 * Start command implementation for kb-run
 * 
 * This command builds (if needed) and launches an IDE in the agent context directory:
 * 1. Checks if output directory exists
 * 2. Builds based on update mode strategy
 * 3. Launches the appropriate IDE
 * 
 * Usage: kb-run start --context=<name> --agent=<name> --package=<path> [options]
 */

import { Command } from 'commander';
import { resolve, join } from 'path';
import { pathExists } from 'fs-extra';
import { spawn, execSync } from 'child_process';
import { open as fsOpen, close as fsClose } from 'fs';
import chalk from 'chalk';
import { DEFAULT_BASE_PROMPT } from '../types.js';
import type { BuildOptions, TargetIDE, LaunchMode, UpdateMode } from '../types.js';
import { scaffold } from '../scaffold.js';
import {
  resolveCommandOptions,
  resolvePackagePath,
  resolveUserBasePrompt,
  validateExplicitStartFlags,
} from '../validate.js';
import { runInteractiveMode } from '../interactive.js';
import { buildCommandString } from '../command-builder.js';

/**
 * Registers the start command with commander
 * 
 * @param program - Commander program instance
 */
export function registerStartCommand(program: Command): void {
  program
    .command('start')
    .description('Build and launch IDE in agent context directory')
    .option('--context <name>', 'dtctl context name')
    .option('--agent <name>', 'agent identifier')
    .option('--package <name>', 'built-in package name (default: dt-knowledge-base-all)')
    .option('--package-file <path>', 'path to custom package file')
    .option('--output <path>', 'output directory (default: /tmp/kb-run/<context>/<agent>)')
    .option('--target <type>', 'target IDE: opencode, copilot, claude, vscode, or windsurf')
    .option('--runtime <name>', 'runtime: system-bash, py-bash, or dt-mcp-server', 'system-bash')
    .option('--mode <type>', 'launch mode: tui, web, or detached', 'tui')
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
  $ kb-run start
  # Use default built-in package (always replaces and rebuilds)
  $ kb-run start --context=abc12345 --agent=monitor
  # Launch in TUI mode (default, foreground)
  $ kb-run start --context=abc12345 --agent=monitor --mode=tui
  # Launch OpenCode web interface
  $ kb-run start --context=abc12345 --agent=monitor --mode=web
  # Launch in background (detached)
  $ kb-run start --context=abc12345 --agent=monitor --mode=detached
  # Use specific built-in package
  $ kb-run start --context=prod-eu --agent=log-analyzer --package=dt-knowledge-base-all --target=copilot
  # Use custom package file
  $ kb-run start --context=dev --agent=app-monitor --package-file=./monitoring.yaml
  # Use explicit knowledge base path
  $ kb-run start --kb-root /path/to/ai-agent-knowledge-base/knowledge-base --context=abc --agent=monitor
  # Use auto-detection (default)
  $ kb-run start --context=abc --agent=monitor
  # Skip rebuild if directory exists (use existing)
  $ kb-run start --context=dev --agent=monitor --update-mode=skip

  # Explicit runtime selection (default is system-bash):
  $ kb-run start --runtime=system-bash --context=prod --agent=plan --target=opencode

  # py-bash runtime with explicit path override:
  $ kb-run start --runtime=py-bash --py-bash ~/dev/dt-mcp-servers --context=prod --agent=plan --target=opencode

Description:
  The start command combines build and launch in one step:
  - By default, always rebuilds to ensure latest skills/config (update-mode=replace)
  - Launches the specified IDE (opencode, copilot, claude, vscode, or windsurf)
  - Switches dtctl context to match the selected environment
  This ensures you always have a fully up-to-date environment.

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
   --mode <type>            launch mode: tui, web, or detached (default: tui)
                           - tui: foreground terminal UI (interactive, blocks terminal)
                           - web: web interface (for opencode only, opens browser)
                           - detached: background process (non-interactive)
  --update-mode <mode>     how to handle existing directory (default: replace)
                           - replace: always rebuild to get latest (recommended)
                           - prompt: ask before rebuilding
                           - skip: reuse existing directory if it exists
                           - fail: error if directory exists
  --non-interactive        disable interactive mode (require all arguments)
  --base-prompt            base prompt file (defaults to system-prompt/SingleTenantPrompt.md)
   --py-bash <path>         optional py-bash repo path override (used with --runtime=py-bash)
`)
    .action(async (options) => {
      try {
        await executeStartCommand(options);
      } catch (error) {
        console.error(chalk.red('\n❌ Error: ' + (error instanceof Error ? error.message : String(error)) + '\n'));
        process.exit(1);
      }
    });
}

/**
 * Execute the start command
 * 
 * @param rawOptions - Raw options from commander
 */
async function executeStartCommand(rawOptions: Record<string, unknown>): Promise<void> {
  validateExplicitStartFlags(rawOptions);

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
    modeRequired: true,
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

  const { context, agent, target, runtime, updateMode, mode, options, usedInteractive, kbRoot } = resolved;

  // Web mode is only supported for opencode
  if (mode === 'web' && target !== 'opencode') {
    throw new Error(`Web mode (--mode=web) is only supported for OpenCode. Use --mode=tui or --mode=detached for ${target}.`);
  }

  // Determine output directory
  const outputDir = options.output 
    ? resolve(options.output as string) 
    : join('/tmp', 'kb-run', context, agent);

  // Check if directory exists
  const dirExists = await pathExists(outputDir);
  
  // Determine if we should build
  let shouldBuild = false;
  if (!dirExists) {
    shouldBuild = true;
  } else {
    // Directory exists - respect update mode
    switch (updateMode) {
      case 'replace':
        shouldBuild = true;
        break;
      case 'skip':
        shouldBuild = false;
        break;
      case 'prompt':
      case 'fail':
        // Let scaffold handle these modes
        shouldBuild = true;
        break;
    }
  }

  // If interactive mode was used, show the equivalent command
  if (usedInteractive) {
    const packageName = options.package as string | undefined;
    const commandString = buildCommandString({
      command: 'start',
      context,
      agent,
      package: packageName,
      packageFile: options.packageFile as string | undefined,
      output: options.output as string | undefined,
      target,
      runtime,
      mode,
      updateMode: updateMode as UpdateMode,
      basePrompt: resolveUserBasePrompt(options) ? options.basePrompt as string : undefined,
      pyBashPath: options.pyBash ? resolve(options.pyBash as string) : undefined,
    });
    
    console.log(chalk.cyan('💡 Equivalent command:\n'));
    console.log(chalk.white(`   ${commandString}\n`));
  }

  if (shouldBuild) {
    // Need to build
    if (dirExists) {
      if (updateMode === 'replace') {
        console.log(chalk.yellow(`⚠️  Rebuilding to ensure latest skills and config (update-mode=replace)\n`));
      } else {
        console.log(chalk.cyan(`📦 Building...\n`));
      }
    } else {
      console.log(chalk.cyan(`📦 Directory doesn't exist, building...\n`));
    }

    // Resolve package path from --package or --package-file
    const packageName = options.package as string | undefined;
    const packageFile = options.packageFile as string | undefined;
    const resolvedPackagePath = await resolvePackagePath(packageName, packageFile);
    const resolvedBasePrompt = resolveUserBasePrompt(options);

    // Build options object
    const buildOptions: BuildOptions = {
      context,
      agent,
      packageFile: resolvedPackagePath,
      output: outputDir,
      updateMode: updateMode as UpdateMode,
      basePrompt: resolvedBasePrompt,
      target,
      runtime,
      pyBashPath: options.pyBash ? resolve(options.pyBash as string) : undefined,
      kbRoot,
    };

    // Build the environment
    await scaffold(buildOptions);
  } else {
    // Skip build
    console.log(chalk.green(`✓ Directory already exists: ${outputDir}`));
    console.log(chalk.cyan('  Skipping build (update-mode=skip)\n'));
  }

  // Switch dtctl context before launching IDE
  await switchDtctlContext(context);

  // Launch IDE
  await launchIDE(target, outputDir, mode);
}

function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * Cross-platform check if a command is available in PATH.
 * Uses `where` on Windows and `which` on Unix/macOS.
 * 
 * @param command - The command name to check
 * @returns true if the command is found, false otherwise
 */
function isCommandAvailable(command: string): boolean {
  const checker = isWindows() ? 'where' : 'which';
  try {
    execSync(`${checker} ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Switch the active dtctl context to match the selected tenant
 * 
 * @param context - The dtctl context name to switch to
 * @throws Error if context switch fails
 */
async function switchDtctlContext(context: string): Promise<void> {
  console.log(chalk.cyan(`🔄 Setting dtctl context to: ${context}...\n`));
  // Check if dtctl is available
  if (!isCommandAvailable('dtctl')) {
    console.log(chalk.yellow('⚠️  dtctl command not found in PATH'));
    console.log(chalk.yellow('   Skipping context switch (dtctl commands may target wrong environment)\n'));
    return;
  }

  try {
    execSync(`dtctl config use-context ${context}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    console.log(chalk.green(`✓ dtctl context set to: ${context}\n`));
  } catch (error: any) {
    throw new Error(
      `Failed to switch dtctl context to "${context}". ` +
      `Ensure the context exists (run: dtctl config get-contexts). ` +
      `Error: ${error.message}`
    );
  }
}

/**
 * Launch the specified IDE
 * 
 * @param target - Target IDE to launch
 * @param outputDir - Directory to launch IDE in
 * @param mode - Launch mode (tui, web, or detached)
 */
async function launchIDE(target: TargetIDE, outputDir: string, mode: LaunchMode = 'tui'): Promise<void> {
  console.log(chalk.cyan(`🚀 Launching ${target}${mode === 'web' ? ' web interface' : ''}...\n`));

  // Determine IDE command and arguments
  let command: string;
  let args: string[];
  let spawnOptions: any;
  switch (target) {
    case 'opencode':
      command = 'opencode';
      if (mode === 'web') {
        // Launch web interface - needs special handling to keep running
        args = ['web', outputDir];
        // Open /dev/null for stdin to prevent process from reading terminal
        const stdinFd = await new Promise<number>((resolve, reject) => {
          fsOpen('/dev/null', 'r', (err, fd) => {
            if (err) reject(err);
            else resolve(fd);
          });
        });
        spawnOptions = { 
          stdio: [stdinFd, 'ignore', 'ignore'],  // stdin from /dev/null, stdout/stderr ignored
          detached: true,
          cwd: outputDir
        };
        console.log(chalk.cyan(`📱 OpenCode web interface will be available at: http://127.0.0.1:4096/\n`));
      } else if (mode === 'tui') {
        // Launch foreground TUI
        args = [outputDir];
        spawnOptions = { 
          stdio: 'inherit',  // Allow interaction with TUI
          detached: false    // Keep attached to terminal
        };
        console.log(chalk.yellow(`💡 TUI mode: Press Ctrl+C to exit\n`));
      } else { // detached
        // Launch background process
        args = [outputDir];
        spawnOptions = { 
          stdio: 'ignore', 
          detached: true 
        };
      }
      break;
    case 'copilot':
      command = 'copilot';
      args = [];
      if (mode === 'tui') {
        spawnOptions = { stdio: 'inherit', detached: false, cwd: outputDir };
        console.log(chalk.yellow(`💡 TUI mode: Press Ctrl+C to exit\n`));
      } else {
        spawnOptions = { stdio: 'ignore', detached: true, cwd: outputDir };
      }
      break;
    case 'claude':
      command = 'claude';
      args = [outputDir];
      if (mode === 'tui') {
        spawnOptions = { stdio: 'inherit', detached: false };
        console.log(chalk.yellow(`💡 TUI mode: Press Ctrl+C to exit\n`));
      } else {
        spawnOptions = { stdio: 'ignore', detached: true };
      }
      break;
    case 'vscode':
      command = 'code';
      args = [outputDir];
      if (mode === 'tui') {
        spawnOptions = { stdio: 'inherit', detached: false };
        console.log(chalk.yellow(`💡 Launching VSCode (use GitHub Copilot extension inside)\n`));
      } else {
        spawnOptions = { stdio: 'ignore', detached: true };
      }
      break;
    case 'windsurf':
      command = 'surf';
      args = [outputDir];
      if (mode === 'tui') {
        spawnOptions = { stdio: 'inherit', detached: false };
        console.log(chalk.yellow(`💡 Launching Windsurf\n`));
      } else {
        spawnOptions = { stdio: 'ignore', detached: true };
      }
      break;
    default:
      throw new Error(`Unknown target: ${target}`);
  }

  // Check if command exists
  if (!isCommandAvailable(command)) {
    console.log(chalk.yellow(`⚠️  Command '${command}' not found in PATH`));
    console.log(chalk.yellow(`   Please launch ${target} manually in: ${outputDir}\n`));
    return;
  }

  // On Windows, .cmd shims (e.g. code.cmd, cursor.cmd) cannot be spawned
  // without shell:true — spawn would throw ENOENT looking for a .exe binary.
  if (isWindows()) {
    spawnOptions = { ...spawnOptions, shell: true };
  }

  // Launch IDE
  try {
    const child = spawn(command, args, spawnOptions);

    if (mode === 'tui') {
      // Don't unref - keep process attached to terminal
      // Wait for child process to exit (blocking)
      await new Promise<void>((resolve) => {
        child.on('exit', (code) => {
          console.log(chalk.gray(`\n${target} exited with code ${code}\n`));
          resolve();
        });
        child.on('error', (err) => {
          console.log(chalk.red(`\n❌ ${target} error: ${err.message}\n`));
          resolve();
        });
      });
    } else {
      // Allow the process to run independently
      child.unref();
      // Close the stdin file descriptor if we opened one for web mode
      if (mode === 'web' && typeof spawnOptions.stdio[0] === 'number') {
        fsClose(spawnOptions.stdio[0], () => {});
      }
      console.log(chalk.green(`✓ Launched ${target} in ${mode} mode: ${outputDir}\n`));
      if (mode === 'web') {
        console.log(chalk.cyan(`💡 Tip: To stop the web server, run: pkill -f "opencode web"\n`));
      }
    }
  } catch (error) {
    console.log(chalk.red(`❌ Failed to launch ${command}: ${error}`));
    console.log(chalk.yellow(`   Please launch ${target} manually in: ${outputDir}\n`));
  }
}
