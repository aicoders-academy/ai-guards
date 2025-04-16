import { Command } from 'commander';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import addCommand from '../../commands/add';
import * as templateManager from '../../utils/template-manager';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('inquirer');
jest.mock('../../utils/template-manager');
// Mock chalk at the top level
jest.mock('chalk', () => ({
  blue: jest.fn((text: string) => text),
  green: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  cyan: jest.fn((text: string) => text),
  white: jest.fn((text: string) => text)
}));

describe('Add Command', () => {
  let program: Command;
  let actionCallback: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    // Setup mocks for dependencies
    (templateManager.getAiGuardsDir as unknown as jest.Mock).mockReturnValue('/fake/path/.ai-guards');
    (fs.pathExists as unknown as jest.Mock).mockResolvedValue(true); // Default: initialized
    (templateManager.getAvailableTemplates as unknown as jest.Mock).mockResolvedValue([
      {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test description',
        category: 'test'
      }
    ]);
    (templateManager.isTemplateInstalled as unknown as jest.Mock).mockResolvedValue(false); // Default: not installed
    (templateManager.installTemplate as unknown as jest.Mock).mockResolvedValue(undefined);
    
    // Setup commander
    program = new Command();
    program.command = jest.fn().mockReturnThis();
    program.description = jest.fn().mockReturnThis();
    program.option = jest.fn().mockReturnThis();
    program.action = jest.fn().mockImplementation((cb) => {
      actionCallback = cb;
      return program;
    });
    
    // Initialize the command
    addCommand(program);
  });
  
  it('should register the command correctly', () => {
    expect(program.command).toHaveBeenCalledWith('add [template]');
    expect(program.description).toHaveBeenCalledWith('Add a prompt template to your project');
    expect(program.option).toHaveBeenCalledWith('-l, --list', 'List available templates');
    expect(program.action).toHaveBeenCalled();
  });
  
  it('should check if AI Guards is initialized', async () => {
    // Override: not initialized
    (fs.pathExists as unknown as jest.Mock).mockResolvedValue(false);
    
    // Should throw a specific error in test mode
    await expect(actionCallback()).rejects.toThrow('Error adding template: AI Guards not initialized');
    
    expect(fs.pathExists).toHaveBeenCalledWith('/fake/path/.ai-guards');
    expect(console.error).toHaveBeenCalled();
  });
  
  it('should list available templates with --list flag', async () => {
    // Should throw a specific exit success error in test mode
    await expect(actionCallback(null, { list: true })).rejects.toThrow('Exit with success');
    
    expect(templateManager.getAvailableTemplates).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });
  
  it('should launch interactive selection if no template provided', async () => {
    // Mock the actual functionality of inquirer for interactive selection
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({
      selectedTemplate: 'test-template'
    });
    
    await actionCallback(null, {});
    
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(templateManager.installTemplate).toHaveBeenCalledWith('test-template');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Template "test-template" installed successfully'));
  });
  
  it('should install a specific template when provided', async () => {
    await actionCallback('test-template', {});
    
    expect(templateManager.installTemplate).toHaveBeenCalledWith('test-template');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Template "test-template" installed successfully'));
  });
  
  it('should skip if template is already installed', async () => {
    // Override: already installed
    (templateManager.isTemplateInstalled as unknown as jest.Mock).mockResolvedValue(true);
    
    // Should throw exit success error in test mode
    await expect(actionCallback('test-template', {})).rejects.toThrow('Exit with success');
    
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('already installed'));
    expect(templateManager.installTemplate).not.toHaveBeenCalled();
  });
  
  it('should handle errors during template installation', async () => {
    const testError = new Error('Installation error');
    (templateManager.installTemplate as unknown as jest.Mock).mockRejectedValue(testError);
    
    // Should throw a specific error in test mode
    await expect(actionCallback('test-template', {})).rejects.toThrow('Error adding template: Installation error');
    
    expect(console.error).toHaveBeenCalled();
  });
}); 