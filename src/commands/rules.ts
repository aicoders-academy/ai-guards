import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { syncRegistry, addRule } from '../utils/registry-manager';
import { loadConfig, RuleMeta } from '../utils/config-manager';

/**
 * Register `ai-guards rules <action>` sub‑commands.
 */
export default function rulesCommand(program: Command): void {
  const rules = program
    .command('rules')
    .description('Manage AI Guards rule registry');

  // -------------------------
  // rules list [--json]
  // -------------------------
  rules
    .command('list')
    .description('List all rules registered in ai-guards.json')
    .option('--json', 'Output raw JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();
        const rules = config.rules;
        
        if (options.json) {
          console.log(JSON.stringify({ version: 1, rules }, null, 2));
          return;
        }

        if (rules.length === 0) {
          console.log(chalk.yellow('Registry is empty – run "ai-guards rules sync" to populate it.'));
          return;
        }

        // Basic table output
        console.log(chalk.blue('\nInstalled Rules:'));
        console.table(
          rules.map(r => ({
            id: r.id,
            type: r.ruleType,
            path: r.path,
            globs: r.globs ? r.globs.join(',') : '',
            extensions: r.fileExtensions ? r.fileExtensions.join(',') : ''
          }))
        );
      } catch (error) {
        console.error(chalk.red('Failed to list rules:'), error);
      }
    });

  // -------------------------
  // rules sync
  // -------------------------
  rules
    .command('sync')
    .description('Rebuild the registry by scanning .ai-guards/rules folder')
    .action(async () => {
      try {
        await syncRegistry();
        console.log(chalk.green('Registry synced successfully.'));
      } catch (error) {
        console.error(chalk.red('Failed to sync registry:'), error);
      }
    });
    
  // -------------------------
  // rules add <rule-file> [--category]
  // -------------------------
  rules
    .command('add <rule-file>')
    .description('Add a rule file to project and register it')
    .option(
      '-c, --category <category>', 
      'Category to add rule to', 
      /^(guidelines|security|general)$/i, 
      'guidelines'
    )
    .action(async (ruleFile, options) => {
      try {
        // Validate that the source file exists
        if (!await fs.pathExists(ruleFile)) {
          console.error(chalk.red(`Rule file not found: ${ruleFile}`));
          process.exit(1);
        }

        // Ensure category folder exists
        const category = options.category.toLowerCase();
        const aiGuardsDir = path.join(process.cwd(), '.ai-guards');
        const rulesDir = path.join(aiGuardsDir, 'rules', category);
        await fs.ensureDir(rulesDir);

        // Copy file to destination
        const fileName = path.basename(ruleFile);
        const destPath = path.join(rulesDir, fileName);
        await fs.copy(ruleFile, destPath, { overwrite: true });
        
        console.log(chalk.green(`Rule file copied to: ${destPath}`));

        // Update registry
        await addRule(destPath);
        console.log(chalk.green('Registry updated successfully.'));
      } catch (error) {
        console.error(chalk.red('Failed to add rule:'), error);
      }
    });
} 