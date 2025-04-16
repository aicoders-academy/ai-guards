import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generatePlanId } from '../utils/idGenerator';

export default function planCommand(program: Command): void {
  program
    .command('plan')
    .description('Generate a new AI plan')
    .option('-t, --title <title>', 'Title for the plan')
    .option('-a, --author <author>', 'Author of the plan')
    .action(async (options) => {
      try {
        const aiGuardsDir = path.join(process.cwd(), '.ai-guards');
        const plansDir = path.join(aiGuardsDir, 'plans');
        
        // Ensure plans directory exists
        await fs.ensureDir(plansDir);
        
        // Prompt for missing information
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Title for the plan:',
            when: !options.title,
            validate: (input: string) => input.length > 0 ? true : 'Title is required'
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author of the plan:',
            when: !options.author,
            default: 'ai-guards'
          },
          {
            type: 'input',
            name: 'scope',
            message: 'Scope of the plan:',
            validate: (input: string) => input.length > 0 ? true : 'Scope is required'
          },
          {
            type: 'editor',
            name: 'functionalReqs',
            message: 'Functional requirements (one per line):',
          },
          {
            type: 'editor',
            name: 'nonFunctionalReqs',
            message: 'Non-functional requirements (one per line):',
          },
          {
            type: 'input',
            name: 'guidelines',
            message: 'Guidelines & packages (comma separated):',
          },
          {
            type: 'editor',
            name: 'threatModel',
            message: 'Threat model stub (one per line):',
          },
          {
            type: 'editor',
            name: 'executionPlan',
            message: 'Execution plan steps (one per line):',
          }
        ]);
        
        // Combine options and answers
        const planData = {
          title: options.title || answers.title,
          author: options.author || answers.author,
          scope: answers.scope,
          functionalReqs: answers.functionalReqs,
          nonFunctionalReqs: answers.nonFunctionalReqs,
          guidelines: answers.guidelines,
          threatModel: answers.threatModel,
          executionPlan: answers.executionPlan
        };
        
        // Generate plan ID and date
        const planId = generatePlanId();
        const createdAt = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Format function for requirements and steps
        const formatLines = (text: string): string => {
          return text
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .map((line: string) => `- ${line.trim().startsWith('-') ? line.trim().substring(1).trim() : line.trim()}`)
            .join('  \n');
        };
        
        // Create plan content
        const planContent = `---
id: ${planId}
title: ${planData.title}
createdAt: ${createdAt}
author: ${planData.author}
status: in-progress
---

## 🧩 Scope

${planData.scope}

## ✅ Functional Requirements

${formatLines(planData.functionalReqs)}

## ⚙️ Non-Functional Requirements

${formatLines(planData.nonFunctionalReqs)}

## 📚 Guidelines & Packages

${formatLines(planData.guidelines)}

## 🔐 Threat Model (Stub)

${formatLines(planData.threatModel)}

## 🔢 Execution Plan

${planData.executionPlan
  .split('\n')
  .filter((line: string) => line.trim().length > 0)
  .map((line: string, index: number) => `${index + 1}. ${line.trim().replace(/^\d+\.?\s*/, '')}`)
  .join('  \n')}
`;
        
        // Save plan to file
        const planFilename = `${planId}-${planData.title.toLowerCase().replace(/\s+/g, '-')}.mdc`;
        const planFilePath = path.join(plansDir, planFilename);
        
        await fs.writeFile(planFilePath, planContent);
        
        console.log(chalk.green(`Plan created successfully: ${planFilename}`));
        console.log(chalk.blue(`Plan ID: ${planId}`));
        console.log(chalk.blue(`Saved to: ${planFilePath}`));
      } catch (error) {
        console.error(chalk.red('Error generating plan:'), error);
        process.exit(1);
      }
    });
} 