#!/usr/bin/env node

import { Command } from 'commander';
import initCommand from './commands/init';
import planCommand from './commands/plan';
import { version } from '../package.json';

// Create a new commander program
const program = new Command();

// Set up the basic program info
program
  .name('ai-guards')
  .description('AI-powered feature planning tool with MCP integration')
  .version(version);

// Register commands
initCommand(program);
planCommand(program);

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 