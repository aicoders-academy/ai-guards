import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  getAiGuardsDir,
  getAvailableTemplates, 
  installTemplate, 
  isTemplateInstalled
} from '../utils/template-manager';

// For testability
export const errorHandler = (error: Error): never => {
  console.error(chalk.red('Error adding template:'), error);
  // Check if we're in test mode
  if (global.__TEST__) {
    // In test mode, throw an error instead of exiting
    throw new Error(`Error adding template: ${error.message}`);
  }
  process.exit(1);
};

export const exitSuccess = (): never => {
  // Check if we're in test mode
  if (global.__TEST__) {
    // In test mode, throw an error instead of exiting
    throw new Error('Exit with success');
  }
  process.exit(0);
};

export default function addCommand(program: Command): void {
  program
    .command('add [template]')
    .description('Add a prompt template to your project')
    .option('-l, --list', 'List available templates')
    .action(async (templateId, options) => {
      try {
        // Check if AI Guards is initialized
        const aiGuardsDir = getAiGuardsDir();
        if (!await fs.pathExists(aiGuardsDir)) {
          console.error(chalk.red('AI Guards is not initialized in this project.'));
          console.log(chalk.blue('Run "ai-guards init" first to initialize AI Guards.'));
          return errorHandler(new Error('AI Guards not initialized'));
        }
        
        // If --list flag is provided, list available templates
        if (options.list) {
          await listAvailableTemplates();
          return exitSuccess();
        }
        
        // If no template ID is provided, show interactive selection
        if (!templateId) {
          await interactiveTemplateSelection();
          return;
        }
        
        // Check if template is already installed
        if (await isTemplateInstalled(templateId)) {
          console.log(chalk.yellow(`Template "${templateId}" is already installed.`));
          return exitSuccess();
        }
        
        // Install the template
        console.log(chalk.blue(`Installing template: ${templateId}`));
        await installTemplate(templateId);
        console.log(chalk.green(`Template "${templateId}" installed successfully!`));
        
      } catch (error) {
        return errorHandler(error as Error);
      }
    });
}

/**
 * List all available templates
 */
async function listAvailableTemplates(): Promise<void> {
  const templates = await getAvailableTemplates();
  
  console.log(chalk.blue('\nAvailable templates:'));
  console.log(chalk.blue('-------------------'));
  
  // Group templates by category
  const templatesByCategory: Record<string, any[]> = {};
  templates.forEach(template => {
    if (!templatesByCategory[template.category]) {
      templatesByCategory[template.category] = [];
    }
    templatesByCategory[template.category].push(template);
  });
  
  // Display templates by category
  Object.entries(templatesByCategory).forEach(([category, categoryTemplates]) => {
    console.log(chalk.cyan(`\n${category.toUpperCase()}`));
    categoryTemplates.forEach(template => {
      console.log(`  ${chalk.green(template.id)} - ${template.name}`);
      console.log(`    ${template.description}`);
    });
  });
  
  console.log(chalk.blue('\nTo add a template, run:'));
  console.log(chalk.white('  ai-guards add <template-id>'));
  console.log('');
}

/**
 * Interactive template selection
 */
async function interactiveTemplateSelection(): Promise<void> {
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
  
  const { selectedTemplate } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTemplate',
      message: 'Select a template to add:',
      choices,
      pageSize: 15
    }
  ]);
  
  // Check if template is already installed
  if (await isTemplateInstalled(selectedTemplate)) {
    console.log(chalk.yellow(`Template "${selectedTemplate}" is already installed.`));
    return;
  }
  
  // Install the template
  console.log(chalk.blue(`Installing template: ${selectedTemplate}`));
  await installTemplate(selectedTemplate);
  console.log(chalk.green(`Template "${selectedTemplate}" installed successfully!`));
} 