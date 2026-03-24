/**
 * Interactive mode for kb-run
 * 
 * Provides interactive prompts for selecting package, tenant, agent, and target
 * when required parameters are not provided on the command line.
 */

import { select } from '@inquirer/prompts';
import { execSync, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import type { TargetIDE, RuntimeName } from './types.js';
import { getResolvedAimgrConfig } from './aimgr.js';
import { parseDtctlContextsOutput } from './validate.js';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultBuiltInPackage = 'dt-knowledge-base-all';

function getBuiltInPackagesDir(): string {
  const compiledDir = join(__dirname, 'packages');
  const sourceDir = join(__dirname, '..', 'packages');
  return existsSync(compiledDir) ? compiledDir : sourceDir;
}

function isBuiltInPackage(packageName: string): boolean {
  const packagesDir = getBuiltInPackagesDir();
  return existsSync(join(packagesDir, `${packageName}.yaml`));
}

type AgentInfo = {
  name: string;
  description: string;
};

async function readBuiltInPackageResources(packageName: string): Promise<string[]> {
  const compiledPkgPath = join(__dirname, 'packages', `${packageName}.yaml`);
  const sourcePkgPath = join(__dirname, '..', 'packages', `${packageName}.yaml`);
  const packagePath = existsSync(compiledPkgPath) ? compiledPkgPath : sourcePkgPath;
  const yamlContent = await readFile(packagePath, 'utf-8');
  return Array.from(yamlContent.matchAll(/^\s*-\s+(agent|package|skill|command)\/([^\s#]+)/gm)).map(
    match => `${match[1]}/${match[2]}`
  );
}

async function findLocalPackagePath(packageName: string, kbRoot: string): Promise<string | undefined> {
  const channelDirs = await readdir(kbRoot, { withFileTypes: true });
  for (const entry of channelDirs) {
    if (!entry.isDirectory()) continue;
    const candidatePath = join(kbRoot, entry.name, 'packages', `${packageName}.package.json`);
    if (existsSync(candidatePath)) {
      return candidatePath;
    }
  }
  return undefined;
}

async function readLocalPackageResources(packageName: string, kbRoot: string): Promise<string[] | undefined> {
  const packagePath = await findLocalPackagePath(packageName, kbRoot);
  if (!packagePath) return undefined;
  const content = await readFile(packagePath, 'utf-8');
  const parsed = JSON.parse(content) as { resources?: string[] };
  return parsed.resources || [];
}

async function readLocalAgentDescriptions(kbRoot: string): Promise<Map<string, string>> {
  const descriptions = new Map<string, string>();
  const channelDirs = await readdir(kbRoot, { withFileTypes: true });

  for (const entry of channelDirs) {
    if (!entry.isDirectory()) continue;
    const agentsDir = join(kbRoot, entry.name, 'agents');
    if (!existsSync(agentsDir)) continue;

    const agentFiles = await readdir(agentsDir, { withFileTypes: true });
    for (const file of agentFiles) {
      if (!file.isFile() || !file.name.endsWith('.md')) continue;
      const agentPath = join(agentsDir, file.name);
      const content = await readFile(agentPath, 'utf-8');
      const name = file.name.replace(/\.md$/, '');
      const match = content.match(/^description:\s*(.+)$/m);
      descriptions.set(name, match ? match[1].trim() : 'No description');
    }
  }

  return descriptions;
}

async function listLocalAgents(kbRoot: string): Promise<AgentInfo[]> {
  const descriptions = await readLocalAgentDescriptions(kbRoot);
  return Array.from(descriptions.entries())
    .map(([name, description]) => ({ name, description }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Prompts user to select a built-in package
 * 
 * @returns Selected package name (without .yaml extension)
 */
export async function promptForPackage(): Promise<string> {
  try {
    // Read packages directory
    // Look in same dir as compiled JS (dist/packages/) first, then fall back to source layout (../packages/)
    const packagesDir = getBuiltInPackagesDir();
    const files = await readdir(packagesDir);
    
    // Filter for .yaml files
    const packages = files
      .filter(f => f.endsWith('.yaml'))
      .map(f => f.replace('.yaml', ''));
    
    if (packages.length === 0) {
      console.log(chalk.yellow(`⚠️  No built-in packages found. Using default: ${defaultBuiltInPackage}`));
      return defaultBuiltInPackage;
    }
    
    // Sort with default package first
    packages.sort((a, b) => {
      if (a === defaultBuiltInPackage) return -1;
      if (b === defaultBuiltInPackage) return 1;
      return a.localeCompare(b);
    });
    
    const answer = await select({
      message: 'Select a knowledge base package:',
      choices: packages.map(p => ({ name: p, value: p })),
      default: defaultBuiltInPackage,
    });
    
    return answer;
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Error reading packages directory. Using default: ${defaultBuiltInPackage}`));
    return defaultBuiltInPackage;
  }
}

/**
 * Prompts user to select a dtctl context (tenant)
 * 
 * @returns Selected context name
 */
export async function promptForTenant(): Promise<string> {
  try {
    // Get list of available contexts from dtctl
    const output = execSync('dtctl config get-contexts -o json --plain', {
      encoding: 'utf-8', 
      stdio: 'pipe',
      timeout: 5000 
    });
    const contexts = parseDtctlContextsOutput(output);
    
    if (contexts.length === 0) {
      throw new Error('No dtctl contexts found. Run: dtctl auth login');
    }
    
    // Create choices with descriptions
    const choices = contexts.map(ctx => ({
      name: ctx.current 
        ? `${ctx.name} (current) - ${ctx.environment}`
        : `${ctx.name} - ${ctx.environment}`,
      value: ctx.name,
    }));
    
    const answer = await select({
      message: 'Select a Dynatrace tenant (dtctl context):',
      choices,
      default: contexts.find(ctx => ctx.current)?.name || contexts[0].name,
    });
    
    return answer;
  } catch (error) {
    throw new Error(
      'Failed to get dtctl contexts. ' +
      'Ensure dtctl is installed and you are logged in.\n' +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Resolves all agents included in a package and its dependencies
 * 
 * @param packageName - The package name to resolve (e.g., 'dt-knowledge-base-all' or 'dynatrace-core')
 * @param kbRoot      - The resolved knowledge base root directory (used for isolated aimgr config)
 * @returns Set of agent names included in the package
 */
async function resolvePackageAgents(packageName: string, kbRoot: string): Promise<Set<string>> {
  const agents = new Set<string>();
  
  try {
    // Check if this is a built-in kb-run package
    if (isBuiltInPackage(packageName)) {
      const resources = await readBuiltInPackageResources(packageName);
      for (const resource of resources) {
        if (resource.startsWith('agent/')) {
          agents.add(resource.replace('agent/', ''));
        } else if (resource.startsWith('package/')) {
          const nestedAgents = await resolvePackageAgents(resource.replace('package/', ''), kbRoot);
          nestedAgents.forEach(agent => agents.add(agent));
        }
      }
      return agents;
    }

    const localResources = await readLocalPackageResources(packageName, kbRoot);
    if (localResources) {
      for (const resource of localResources) {
        if (resource.startsWith('agent/')) {
          agents.add(resource.replace('agent/', ''));
        } else if (resource.startsWith('package/')) {
          const nestedAgents = await resolvePackageAgents(resource.replace('package/', ''), kbRoot);
          nestedAgents.forEach(agent => agents.add(agent));
        }
      }
      return agents;
    }
    
    // Try to resolve from aimgr only as a last resort
    // Use isolated config — no global config, no GitHub
    const configPath = await getResolvedAimgrConfig(kbRoot);
    const result = spawnSync(
      'aimgr',
      ['--config', configPath, 'repo', 'show', `package/${packageName}`, '--format=json'],
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    if (result.error) throw result.error;
    const output = result.stdout;
    
    const data = JSON.parse(output);
    
    if (data && data.resources) {
      for (const resource of data.resources) {
        if (resource.startsWith('agent/')) {
          // Extract agent name without 'agent/' prefix
          agents.add(resource.replace('agent/', ''));
        } else if (resource.startsWith('package/')) {
          // Recursively resolve nested packages
          const nestedPackageName = resource.replace('package/', '');
          const nestedAgents = await resolvePackageAgents(nestedPackageName, kbRoot);
          nestedAgents.forEach(agent => agents.add(agent));
        }
      }
    }
    
    return agents;
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Failed to resolve package ${packageName}, showing all agents`));
    return new Set(); // Empty set means no filtering
  }
}

/**
 * Prompts user to select an agent from aimgr
 * 
 * @param packageName - The package name to filter agents by
 * @param kbRoot      - The resolved knowledge base root directory (used for isolated aimgr config)
 * @returns Selected agent name
 */
export async function promptForAgent(packageName: string, kbRoot: string): Promise<string> {
  try {
    const agents = await listLocalAgents(kbRoot);
    
    // Filter agents by package if packageName provided
    const allowedAgents = await resolvePackageAgents(packageName, kbRoot);
    const filteredAgents = allowedAgents.size > 0 
      ? agents.filter((agent: AgentInfo) => allowedAgents.has(agent.name))
      : agents; // If resolution failed, show all agents

    if (filteredAgents.length === 0) {
      throw new Error(`No local agents match package '${packageName}'.`);
    }
    
    // Create choices with descriptions
    const choices = filteredAgents.map((agent: AgentInfo) => ({
      name: `${agent.name} - ${agent.description}`,
      value: agent.name,
    }));
    
    const answer = await select<string>({
      message: 'Select an AI agent:',
      choices,
      pageSize: 15,
    });
    
    return answer;
  } catch (error) {
    throw new Error(
      'Failed to get agent list from aimgr. ' +
      'Ensure aimgr is installed and configured.\n' +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Prompts user to select target IDE
 * 
 * @returns Selected target IDE
 */
export async function promptForTarget(): Promise<TargetIDE> {
  const targets: { name: string; value: TargetIDE }[] = [
    {
      name: 'opencode (default) - Open in OpenCode',
      value: 'opencode',
    },
    {
      name: 'copilot - Open in GitHub Copilot',
      value: 'copilot',
    },
    {
      name: 'claude - Open in Claude Code',
      value: 'claude',
    },
    {
      name: 'vscode - Open in Visual Studio Code (GitHub Copilot extension)',
      value: 'vscode',
    },
    {
      name: 'windsurf - Open in Windsurf',
      value: 'windsurf',
    },
  ];
  
  const answer = await select({
    message: 'Select target IDE:',
    choices: targets,
    default: 'opencode',
  });
  
  return answer;
}

/**
 * Prompts user to select runtime model
 *
 * @returns Selected runtime name
 */
export async function promptForRuntime(): Promise<RuntimeName> {
  const runtimes: { name: string; value: RuntimeName }[] = [
    {
      name: 'system-bash (default) - Native bash tools enabled',
      value: 'system-bash',
    },
    {
      name: 'py-bash - Bash via python MCP backend',
      value: 'py-bash',
    },
    {
      name: 'dt-mcp-server - Dynatrace MCP server runtime',
      value: 'dt-mcp-server',
    },
  ];

  const answer = await select({
    message: 'Select runtime:',
    choices: runtimes,
    default: 'system-bash',
  });

  return answer;
}


/**
 * Interactive mode entry point
 * 
 * Prompts for all required parameters if they are not provided.
 * Returns an object with the selected values.
 * 
 * @param options - Current command options (may have some values already)
 * @returns Complete options object with all required values
 */
export async function runInteractiveMode(options: {
  package?: string;
  packageFile?: string;
  context?: string;
  agent?: string;
  target?: string;
  runtime?: RuntimeName;
  kbRoot: string;
}): Promise<{
  package?: string;
  packageFile?: string;
  context: string;
  agent: string;
  target: TargetIDE;
  runtime: RuntimeName;
  pyBashPath: string | undefined;
}> {
  console.log(chalk.cyan('\n🔧 Interactive Mode\n'));
  
  // Prompt for package if not provided (and no package-file)
  let packageName = options.package;
  if (!packageName && !options.packageFile) {
    packageName = await promptForPackage();
  }
  
  // Prompt for tenant if not provided
  let context = options.context;
  if (!context) {
    context = await promptForTenant();
  }
  
  // Prompt for agent if not provided
  let agent = options.agent;
  if (!agent) {
    agent = await promptForAgent(packageName || defaultBuiltInPackage, options.kbRoot);
  }
  
  // Prompt for target if not provided
  let target = options.target as TargetIDE | undefined;
  if (!target) {
    target = await promptForTarget();
  }

  let runtime = options.runtime;
  if (!runtime) {
    runtime = await promptForRuntime();
  }
  
  
  // pyBashPath is not prompted in interactive mode — CLI flag only
  const pyBashPath = undefined;
  
  console.log(chalk.green('\n✓ Configuration complete\n'));
  
  return {
    package: packageName,
    packageFile: options.packageFile,
    context,
    agent,
    target,
    runtime,
    pyBashPath,
  };
}
