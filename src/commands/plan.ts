import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { generatePlanId } from '../utils/idGenerator';
import { getGitUser } from '../utils/gitUtils';

export default function planCommand(program: Command): void {
  program
    .command('plan')
    .description('Generate a new AI plan template')
    .option('-t, --title <title>', 'Title for the plan')
    .option('-a, --author <author>', 'Author of the plan')
    .action(async (options) => {
      try {
        const aiGuardsDir = path.join(process.cwd(), '.ai-guards');
        const plansDir = path.join(aiGuardsDir, 'plans');
        
        // Ensure plans directory exists
        await fs.ensureDir(plansDir);
        
        // Use options or defaults
        const title = options.title || 'Your Plan Title';
        
        // Get author from options, or from git user, or use default
        let author = options.author;
        if (!author) {
          const gitUser = await getGitUser();
          author = gitUser.name || 'ai-guards';
        }
        
        // Generate plan ID and date
        const planId = generatePlanId();
        const createdAt = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create plan template content
        const planContent = `---
id: ${planId}
title: ${title}
createdAt: ${createdAt}
author: ${author}
status: draft
---

## 🧩 Scope

Your project scope description here...

## ✅ Functional Requirements

- Requirement 1
- Requirement 2
- Requirement 3

## ⚙️ Non-Functional Requirements

- Performance: specify requirements
- Security: specify requirements 
- Scalability: specify requirements

## 📚 Guidelines & Packages

- Follow project guidelines: specify which ones
- Packages to use: list them here with license

## 🔐 Threat Model (Stub)

- Security threat 1
- Security threat 2

## 🔢 Execution Plan

1. First implementation step
2. Second implementation step
3. Third implementation step
`;
        
        // Save plan to file
        const planFilename = `${planId}-${title.toLowerCase().replace(/\s+/g, '-')}.md`;
        const planFilePath = path.join(plansDir, planFilename);
        
        await fs.writeFile(planFilePath, planContent);
        
        console.log(chalk.green(`Plan template created successfully: ${planFilename}`));
        console.log(chalk.blue(`Plan ID: ${planId}`));
        console.log(chalk.blue(`Saved to: ${planFilePath}`));
        console.log(chalk.yellow(`Edit the file to fill in your plan details`));
      } catch (error) {
        console.error(chalk.red('Error generating plan template:'), error);
        process.exit(1);
      }
    });
} 