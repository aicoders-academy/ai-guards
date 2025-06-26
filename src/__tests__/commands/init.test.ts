import { Command } from 'commander';

// Mock fs-extra
jest.mock('fs-extra');

// Mock plansUtils
jest.mock('../../utils/plansUtils');

// Mock chalk factory
jest.mock('chalk', () => ({
  blue: jest.fn((text: string) => text),
  green: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  white: jest.fn((text: string) => text),
  cyan: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text)
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation();

import * as fs from 'fs-extra';
import chalk from 'chalk';
import initCommand from '../../commands/init';
import * as plansUtils from '../../utils/plansUtils';

describe('Init Command', () => {
  let program: Command;
  let mockAction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExit.mockClear();
    
    program = new Command();
    
    // Mock the command builder pattern
    const mockCommandBuilder = {
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn()
    };
    
    jest.spyOn(program, 'command').mockReturnValue(mockCommandBuilder as any);
    mockAction = mockCommandBuilder.action;
  });

  it('should register the init command with folder option', () => {
    initCommand(program);
    
    expect(program.command).toHaveBeenCalledWith('init');
    const mockCommandBuilder = (program.command as jest.Mock).mock.results[0].value;
    expect(mockCommandBuilder.description).toHaveBeenCalledWith('Initialize AI Guards in your project');
    expect(mockCommandBuilder.option).toHaveBeenCalledWith('-f, --folder <name>', 'Folder name for plans (default: .plans)');
  });

  it('should successfully initialize with default folder when not already initialized', async () => {
    (plansUtils.isProjectInitialized as jest.Mock).mockResolvedValue(false);
    (plansUtils.getDefaultPlansPath as jest.Mock).mockReturnValue('/test/.plans');
    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    
    initCommand(program);
    const actionHandler = mockAction.mock.calls[0][0];
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await actionHandler({});
    
    expect(plansUtils.isProjectInitialized).toHaveBeenCalled();
    expect(plansUtils.getDefaultPlansPath).toHaveBeenCalledWith(process.cwd(), undefined);
    expect(fs.ensureDir).toHaveBeenCalledWith('/test/.plans');
    expect(fs.writeFile).not.toHaveBeenCalled(); // No config file for default
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Creating AI Guards directory structure (.plans)'));
    
    consoleSpy.mockRestore();
  });

  it('should successfully initialize with custom folder', async () => {
    (plansUtils.isProjectInitialized as jest.Mock).mockResolvedValue(false);
    (plansUtils.getDefaultPlansPath as jest.Mock).mockReturnValue('/test/my-plans');
    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    
    initCommand(program);
    const actionHandler = mockAction.mock.calls[0][0];
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await actionHandler({ folder: 'my-plans' });
    
    expect(plansUtils.getDefaultPlansPath).toHaveBeenCalledWith(process.cwd(), 'my-plans');
    expect(fs.ensureDir).toHaveBeenCalledWith('/test/my-plans');
    expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('.ai-guards-config'), 'my-plans');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Creating AI Guards directory structure (my-plans)'));
    
    consoleSpy.mockRestore();
  });

  it('should show warning when already initialized', async () => {
    (plansUtils.isProjectInitialized as jest.Mock).mockResolvedValue(true);
    
    initCommand(program);
    const actionHandler = mockAction.mock.calls[0][0];
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await actionHandler({});
    
    expect(fs.ensureDir).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already initialized'));
    
    consoleSpy.mockRestore();
  });

  it('should handle errors gracefully', async () => {
    (plansUtils.isProjectInitialized as jest.Mock).mockRejectedValue(new Error('File system error'));
    
    initCommand(program);
    const actionHandler = mockAction.mock.calls[0][0];
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await actionHandler({});
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error initializing AI Guards'),
      expect.any(Error)
    );
    expect(mockExit).toHaveBeenCalledWith(1);
    
    consoleErrorSpy.mockRestore();
  });
});