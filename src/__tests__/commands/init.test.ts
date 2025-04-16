import { Command } from 'commander';
import * as fs from 'fs-extra';
// Remove direct chalk import if only used for types, otherwise keep
// import chalk from 'chalk'; 
import inquirer from 'inquirer';
// Import the actual command module default export for type safety
import initCommand from '../../commands/init';
// Remove the type import as it's causing issues with the mock and isn't needed
// import type { errorHandler as ErrorHandlerType } from '../../commands/init'; 
import * as templateManager from '../../utils/template-manager';
import path from 'path';

// --- Mocking Section --- 
// Mock dependencies used by the command
jest.mock('fs-extra');
jest.mock('inquirer');
jest.mock('../../utils/template-manager');
// Mock chalk factory
jest.mock('chalk', () => ({
  blue: jest.fn((text: string) => text),
  green: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  white: jest.fn((text: string) => text),
  cyan: jest.fn((text: string) => text),
}));

// DO NOT mock process.exit here, rely on setup.js
// jest.mock('process', ...) // REMOVED

// Mock process.cwd() separately if needed by the code under test
jest.spyOn(process, 'cwd').mockReturnValue('/fake/project/path');

// Mock the specific exports from the init module
const mockErrorHandler = jest.fn<never, [Error]>((error: Error) => {
  // Simulate original behavior (logging) if needed for verification
  console.error(`Mocked Error Handler Called: ${error.message}`); 
  // Throw the error that setup.js produces for process.exit(1)
  throw new Error('Process exited with code 1');
});

jest.mock('../../commands/init', () => {
  const originalModule = jest.requireActual('../../commands/init');
  return {
    __esModule: true, // Indicate this is an ES module mock
    // Keep other exports like types if needed (but we removed the type import)
    // ...originalModule, 
    // Override the errorHandler export with our mock
    errorHandler: mockErrorHandler,
    // Keep the default export (the command function) as the original
    default: originalModule.default 
  };
});
// --- End Mocking Section ---


describe('Init Command', () => {
  let program: Command;
  let actionCallback: any;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    // Spy on console methods if needed for verification
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    // Setup mocks for dependencies for typical success paths
    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as unknown as jest.Mock).mockResolvedValue(undefined); // Keep casting
    (templateManager.initTemplates as jest.Mock).mockResolvedValue(undefined);
    (templateManager.getAvailableTemplates as jest.Mock).mockResolvedValue([
      { id: 'test-template', name: 'Test Template', description: 'Test description', category: 'test' }
    ]);
    (templateManager.installTemplate as jest.Mock).mockResolvedValue(undefined);

    // ---- Command Setup ----
    // Import the default export AFTER mocks are set up
    const initCommand = require('../../commands/init').default;

    program = new Command();
    // Mock the commander instance methods needed
    program.command = jest.fn().mockReturnThis();
    program.description = jest.fn().mockReturnThis();
    program.option = jest.fn().mockReturnThis();
    // Capture the action callback when it's registered
    program.action = jest.fn().mockImplementation((cb) => {
      actionCallback = cb;
      return program; // Allow chaining
    });

    // Initialize the command, which will call program.command().action(), etc.
    initCommand(program);
    // ---- End Command Setup ----
  });

  // Restore cwd mock after all tests in this describe block
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should register the command correctly', () => {
    // Assertions remain the same
    expect(program.command).toHaveBeenCalledWith('init');
    expect(program.description).toHaveBeenCalledWith('Initialize AI Guards in the current project');
    expect(program.option).toHaveBeenCalledWith('--templates', 'Initialize with prompt templates');
    expect(program.option).toHaveBeenCalledWith('--no-templates', 'Skip template initialization');
    expect(program.option).toHaveBeenCalledWith('--select-templates', 'Select specific templates to initialize');
    // ... other options
    expect(program.action).toHaveBeenCalled();
  });

  it('should create the directory structure', async () => {
    // Mock inquirer for this specific path
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ initializeTemplates: false });

    // Expect this to complete normally
    await actionCallback({}); 

    // Assertions remain the same
    expect(fs.ensureDir).toHaveBeenCalledTimes(5);
    expect(fs.ensureDir).toHaveBeenCalledWith('/fake/project/path/.ai-guards/rules/guidelines');
    expect(fs.ensureDir).toHaveBeenCalledWith('/fake/project/path/.ai-guards/rules/security');
    expect(fs.ensureDir).toHaveBeenCalledWith('/fake/project/path/.ai-guards/rules/general');
    expect(fs.ensureDir).toHaveBeenCalledWith('/fake/project/path/.ai-guards/templates');
    expect(fs.ensureDir).toHaveBeenCalledWith('/fake/project/path/.ai-guards/plans');
    expect(fs.writeFile).toHaveBeenCalled(); 
    expect(mockErrorHandler).not.toHaveBeenCalled(); // Ensure error handler wasn't called
  });

  // ... other successful test cases (skip, init all, select, default+init, default+select) ...
  // Ensure these tests call await actionCallback(...) directly without try/catch
  // and verify mocks like templateManager, inquirer, console.log as needed.
  // Add expect(mockErrorHandler).not.toHaveBeenCalled(); to successful tests.

  it('should skip template initialization with --no-templates flag', async () => {
    await actionCallback({ templates: false });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Skipping template initialization'));
    expect(templateManager.initTemplates).not.toHaveBeenCalled();
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it('should initialize all templates with --templates flag', async () => {
    await actionCallback({ templates: true });
    expect(templateManager.initTemplates).toHaveBeenCalledWith(true);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Templates initialized successfully'));
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });
  
  it('should handle template selection with --select-templates flag', async () => {
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ selectedTemplates: ['test-template'] });
    await actionCallback({ selectTemplates: true });
    expect(templateManager.getAvailableTemplates).toHaveBeenCalled();
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(templateManager.initTemplates).toHaveBeenCalledWith(false); 
    expect(templateManager.installTemplate).toHaveBeenCalledWith('test-template');
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it('should ask user about template initialization by default and init all', async () => {
     (inquirer.prompt as unknown as jest.Mock)
       .mockResolvedValueOnce({ initializeTemplates: true })
       .mockResolvedValueOnce({ selectSpecific: false });    
    await actionCallback({});
    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
    expect(templateManager.initTemplates).toHaveBeenCalledWith(true);
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

   it('should ask user about template initialization by default and allow selection', async () => {
     (inquirer.prompt as unknown as jest.Mock)
       .mockResolvedValueOnce({ initializeTemplates: true })
       .mockResolvedValueOnce({ selectSpecific: true })
       .mockResolvedValueOnce({ selectedTemplates: ['test-template'] });
    await actionCallback({});
    expect(inquirer.prompt).toHaveBeenCalledTimes(3); 
    expect(templateManager.getAvailableTemplates).toHaveBeenCalled();
    expect(templateManager.initTemplates).toHaveBeenCalledWith(false); 
    expect(templateManager.installTemplate).toHaveBeenCalledWith('test-template');
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it('should handle errors during initialization', async () => {
    const testError = new Error('Directory creation error');
    (fs.ensureDir as jest.Mock).mockRejectedValueOnce(testError);
    
    // The action should throw a specific error in test mode
    await expect(actionCallback({})).rejects.toThrow('Error initializing AI Guards: Directory creation error');
    
    expect(console.error).toHaveBeenCalled();
  });
}); 