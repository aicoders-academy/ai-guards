import { Command } from 'commander';
import * as path from 'path';
import planCommand from '../../commands/plan';
import { generatePlanId } from '../../utils/idGenerator';

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
  red: jest.fn((text) => text),
  yellow: jest.fn((text) => text)
}));

jest.mock('../../utils/idGenerator', () => ({
  generatePlanId: jest.fn()
}));

// Import mocked modules after mocking
const fs = require('fs-extra');
const chalk = require('chalk');

describe('planCommand', () => {
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
    
    // Mock Date
    jest.spyOn(global.Date.prototype, 'toISOString').mockReturnValue('2023-12-25T12:00:00.000Z');
    
    // Mock generatePlanId
    (generatePlanId as jest.Mock).mockReturnValue('plan-123');
    
    // Create a new Command instance with a mock action callback
    program = new Command();
    actionCallback = jest.fn();
    
    // Mock command() and other methods to capture the callback
    program.command = jest.fn().mockReturnThis();
    program.description = jest.fn().mockReturnThis();
    program.option = jest.fn().mockReturnThis();
    program.action = jest.fn((callback) => {
      actionCallback = jest.fn(callback);
      return program;
    });
  });

  it('should register the plan command with correct description and options', () => {
    planCommand(program);
    
    expect(program.command).toHaveBeenCalledWith('plan');
    expect(program.description).toHaveBeenCalledWith('Generate a new AI plan template');
    expect(program.option).toHaveBeenCalledWith('-t, --title <title>', 'Title for the plan');
    expect(program.option).toHaveBeenCalledWith('-a, --author <author>', 'Author of the plan');
    expect(program.action).toHaveBeenCalled();
  });

  it('should create a plan template file with default values', async () => {
    // Set up fs-extra mocks
    fs.ensureDir.mockResolvedValue(undefined);
    fs.writeFile.mockResolvedValue(undefined);
    
    // Register command and execute action with empty options
    planCommand(program);
    await actionCallback({});
    
    // Verify directory creation
    expect(fs.ensureDir).toHaveBeenCalledWith('/fake/path/.ai-guards/plans');
    
    // Verify generatePlanId was called
    expect(generatePlanId).toHaveBeenCalled();
    
    // Verify file creation
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/plans/plan-123-your-plan-title.md',
      expect.stringContaining('id: plan-123')
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/plans/plan-123-your-plan-title.md',
      expect.stringContaining('title: Your Plan Title')
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/plans/plan-123-your-plan-title.md',
      expect.stringContaining('author: ai-guards')
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/plans/plan-123-your-plan-title.md',
      expect.stringContaining('status: draft')
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/plans/plan-123-your-plan-title.md',
      expect.stringContaining('## 🧩 Scope')
    );
    
    // Verify console output
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Plan template created successfully'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Edit the file to fill in your plan details'));
  });

  it('should use provided options instead of defaults', async () => {
    // Set up fs-extra mocks
    fs.ensureDir.mockResolvedValue(undefined);
    fs.writeFile.mockResolvedValue(undefined);
    
    // Register command and execute action with options
    planCommand(program);
    await actionCallback({
      title: 'Custom Title',
      author: 'Custom Author'
    });
    
    // Verify file creation with custom options
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/plans/plan-123-custom-title.md',
      expect.stringContaining('title: Custom Title')
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/fake/path/.ai-guards/plans/plan-123-custom-title.md',
      expect.stringContaining('author: Custom Author')
    );
  });

  it('should handle errors during plan creation', async () => {
    // Make fs.ensureDir throw an error
    const testError = new Error('Test error');
    fs.ensureDir.mockRejectedValue(testError);
    
    // Register command
    planCommand(program);
    
    // Execute action and expect it to throw
    await expect(async () => {
      await actionCallback({});
    }).rejects.toThrow('Process exited with code 1');
    
    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error generating plan template:'),
      testError
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
}); 