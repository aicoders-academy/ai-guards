import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { isProjectInitialized, getDefaultPlansPath } from '../utils/plansUtils';

interface InitOptions {
  folder?: string;
}

export default function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize AI Guards in your project')
    .option('-f, --folder <name>', 'Folder name for plans (default: .plans)')
    .action(async (options: InitOptions) => {
      try {
        const projectRoot = process.cwd();
        
        // Check if already initialized
        if (await isProjectInitialized(projectRoot)) {
          console.log(chalk.yellow('AI Guards is already initialized in this project'));
          return;
        }
        
        // Get the plans directory path
        const plansDir = getDefaultPlansPath(projectRoot, options.folder);
        const folderName = options.folder || '.plans';
        
        // Create plans directory
        console.log(chalk.blue(`Creating AI Guards directory structure (${folderName})...`));
        await fs.ensureDir(plansDir);
        
        // If using a custom folder name, create a config file to remember it
        if (options.folder && options.folder !== '.plans') {
          const configPath = path.join(projectRoot, '.ai-guards-config');
          await fs.writeFile(configPath, options.folder);
        }
        
        console.log(chalk.green('✓ AI Guards initialized successfully!'));
        console.log(chalk.blue('\nNext steps:'));
        console.log(chalk.white('  1. Create your first plan: ') + chalk.cyan('ai-guards plan'));
        console.log(chalk.white(`  2. Edit the plan in ${folderName}/`));
        console.log(chalk.white('  3. Use with MCP-enabled tools like Cursor'));
        
      } catch (error) {
        console.error(chalk.red('Error initializing AI Guards:'), error);
        process.exit(1);
      }
    });
}