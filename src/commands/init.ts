import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  initTemplates, 
  getAvailableTemplates, 
  installTemplate 
} from '../utils/template-manager';

// For testability
export const errorHandler = (error: Error): never => {
  console.error(chalk.red('Error initializing AI Guards:'), error);
  // Check if we're in test mode
  if (typeof (global as any).__TEST__ !== 'undefined' && (global as any).__TEST__) {
    // In test mode, throw an error instead of exiting
    throw new Error(`Error initializing AI Guards: ${error.message}`);
  }
  process.exit(1);
};

export default function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize AI Guards in the current project')
    .option('--templates', 'Initialize with prompt templates')
    .option('--no-templates', 'Skip template initialization')
    .option('--select-templates', 'Select specific templates to initialize')
    .action(async (options) => {
      console.log(chalk.blue('Initializing AI Guards...'));
      
      try {
        // Create base directory structure
        const aiGuardsDir = path.join(process.cwd(), '.ai-guards');
        
        // Create directories
        const directories = [
          path.join(aiGuardsDir, 'rules', 'guidelines'),
          path.join(aiGuardsDir, 'rules', 'security'),
          path.join(aiGuardsDir, 'rules', 'general'),
          path.join(aiGuardsDir, 'templates'),
          path.join(aiGuardsDir, 'plans')
        ];
        
        for (const dir of directories) {
          await fs.ensureDir(dir);
          console.log(chalk.green(`Created directory: ${dir}`));
        }
        
        // Create sample rule files
        const sampleRule = `---
description: RPC Service boilerplate
globs: 
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
`;
        
        await fs.writeFile(
          path.join(aiGuardsDir, 'rules', 'guidelines', 'service-naming.md'),
          sampleRule
        );
        
        // Handle template initialization
        if (options.templates === false) {
          console.log(chalk.yellow('Skipping template initialization...'));
        } else if (options.selectTemplates) {
          await handleTemplateSelection();
        } else if (options.templates) {
          console.log(chalk.blue('Initializing all templates...'));
          await initTemplates(true);
          console.log(chalk.green('Templates initialized successfully!'));
        } else {
          // Default behavior - ask if they want to initialize templates
          const { initializeTemplates } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'initializeTemplates',
              message: 'Would you like to initialize prompt templates?',
              default: true
            }
          ]);
          
          if (initializeTemplates) {
            // Ask if they want to select specific templates
            const { selectSpecific } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'selectSpecific',
                message: 'Would you like to select specific templates to initialize?',
                default: false
              }
            ]);
            
            if (selectSpecific) {
              await handleTemplateSelection();
            } else {
              console.log(chalk.blue('Initializing all templates...'));
              await initTemplates(true);
              console.log(chalk.green('Templates initialized successfully!'));
            }
          } else {
            console.log(chalk.yellow('Skipping template initialization...'));
            // Just initialize the templates directory and config without installing templates
            await initTemplates(false);
          }
        }
        
        console.log(chalk.green('AI Guards initialized successfully!'));
        console.log(chalk.blue('Directory structure created at .ai-guards/'));
        console.log(chalk.blue('You can add more templates later with:'));
        console.log(chalk.white('  ai-guards add <template-name>'));
      } catch (error) {
        return errorHandler(error as Error);
      }
    });
}

/**
 * Handle interactive template selection
 */
async function handleTemplateSelection(): Promise<void> {
  const availableTemplates = await getAvailableTemplates();
  
  // Group templates by category
  const templatesByCategory: Record<string, any[]> = {};
  availableTemplates.forEach(template => {
    if (!templatesByCategory[template.category]) {
      templatesByCategory[template.category] = [];
    }
    templatesByCategory[template.category].push(template);
  });
  
  // Format template choices with categories as separators
  const choices: any[] = [];
  Object.entries(templatesByCategory).forEach(([category, templates]) => {
    choices.push(new inquirer.Separator(`--- ${category.toUpperCase()} ---`));
    templates.forEach(template => {
      choices.push({
        name: `${template.name} - ${template.description}`,
        value: template.id,
        short: template.name
      });
    });
  });
  
  const { selectedTemplates } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedTemplates',
      message: 'Select templates to initialize:',
      choices,
      pageSize: 15
    }
  ]);
  
  if (selectedTemplates.length === 0) {
    console.log(chalk.yellow('No templates selected. Initializing without templates.'));
    await initTemplates(false);
    return;
  }
  
  console.log(chalk.blue(`Installing ${selectedTemplates.length} template(s)...`));
  
  // First initialize the templates directory and config
  await initTemplates(false);
  
  // Then install each selected template
  for (const templateId of selectedTemplates) {
    try {
      await installTemplate(templateId);
      console.log(chalk.green(`Installed template: ${templateId}`));
    } catch (error) {
      console.error(chalk.red(`Error installing template "${templateId}":`, error));
    }
  }
  
  console.log(chalk.green('Templates initialized successfully!'));
} 