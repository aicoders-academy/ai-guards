import { Command } from 'commander';
import * as path from 'path';
import initCommand from '../../commands/init';

// Mock dependencies
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  writeFile: jest.fn()
}));

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/'))
}));

jest.mock('chalk', () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  red: jest.fn((text) => text)
}));

// Import mocked modules after mocking
const fs = require('fs-extra');
const chalk = require('chalk');

describe('initCommand', () => {
  let program: Command;
  let actionCallback: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/fake/path');
    
    // Mock console.log and console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock process.exit
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
    
    // Create a new Command instance with a mock action callback
    program = new Command();
    actionCallback = jest.fn();
    
    // Mock command() and other methods to capture the callback
    program.command = jest.fn().mockReturnThis();
    program.description = jest.fn().mockReturnThis();
    program.action = jest.fn((callback) => {
      actionCallback = jest.fn(callback);
      return program;
    });
  });

  it('should register the init command with correct description', () => {
    initCommand(program);
    
    expect(program.command).toHaveBeenCalledWith('init');
    expect(program.description).toHaveBeenCalledWith('Initialize AI Guards in the current project');
    expect(program.action).toHaveBeenCalled();
  });

  it('should create directories and sample files when executed', async () => {
    // Set up fs-extra mocks
    fs.ensureDir.mockResolvedValue(undefined);
    fs.writeFile.mockResolvedValue(undefined);
    
    // Register command and execute action
    initCommand(program);
    await actionCallback();
    
    // Verify directory creation
    const expectedDirs = [
      '/fake/path/.ai-guards/rules/guidelines',
      '/fake/path/.ai-guards/rules/security',
      '/fake/path/.ai-guards/rules/general',
      '/fake/path/.ai-guards/templates',
      '/fake/path/.ai-guards/plans'
    ];
    
    expectedDirs.forEach(dir => {
      expect(fs.ensureDir).toHaveBeenCalledWith(dir);
    });
    
    // Verify file creation (partial check)
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/rules/guidelines/service-naming.mdc',
      expect.stringContaining('description: RPC Service boilerplate')
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/templates/component-test.mdc',
      expect.stringContaining('description: Reusable unit test template for components')
    );
    
    // Verify console output
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('AI Guards initialized successfully'));
  });

  it('should handle errors during initialization', async () => {
    // Make fs.ensureDir throw an error
    const testError = new Error('Test error');
    fs.ensureDir.mockRejectedValue(testError);
    
    // Register command
    initCommand(program);
    
    // Execute action and expect it to throw
    await expect(async () => {
      await actionCallback();
    }).rejects.toThrow('Process exited with code 1');
    
    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error initializing AI Guards:'),
      testError
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
}); 