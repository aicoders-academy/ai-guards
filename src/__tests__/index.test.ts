import { Command } from 'commander';

// Use jest.doMock to mock the modules before they're imported 
jest.doMock('commander', () => {
  const mockCommand = {
    name: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    parse: jest.fn(),
    outputHelp: jest.fn(),
    command: jest.fn().mockReturnThis()
  };
  return { Command: jest.fn(() => mockCommand) };
});

jest.doMock('../commands/init', () => jest.fn());
jest.doMock('../commands/plan', () => jest.fn());
jest.doMock('../commands/add', () => jest.fn());

// Mock package.json version
jest.doMock('../../package.json', () => ({
  version: '1.0.0'
}), { virtual: true });

describe('CLI Entry Point', () => {
  let mockProgram;
  let initCommand;
  let planCommand;
  let addCommand;
  let originalArgv;
  
  beforeEach(() => {
    // Clear the module cache
    jest.resetModules();
    
    // Save original argv
    originalArgv = process.argv;
    
    // Now import the mocked modules
    initCommand = require('../commands/init');
    planCommand = require('../commands/plan');
    addCommand = require('../commands/add');
    
    // Mock CLI arguments
    process.argv = ['node', 'src/index.js'];
    
    // Get the mockProgram from commander
    mockProgram = new (require('commander').Command)();
    
    // Clear mocks for fresh test
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore original argv
    process.argv = originalArgv;
  });
  
  it('should initialize the CLI with correct information', () => {
    // Execute the index file
    require('../index');
    
    // Verify program setup
    expect(mockProgram.name).toHaveBeenCalledWith('ai-guards');
    expect(mockProgram.description).toHaveBeenCalledWith(
      expect.stringContaining('Standardize how teams plan, review, execute, and verify')
    );
    expect(mockProgram.version).toHaveBeenCalledWith('1.0.0');
  });
  
  it('should register all commands', () => {
    // Execute the index file
    require('../index');
    
    // Verify commands are registered
    expect(initCommand).toHaveBeenCalledWith(mockProgram);
    expect(planCommand).toHaveBeenCalledWith(mockProgram);
    expect(addCommand).toHaveBeenCalledWith(mockProgram);
  });
  
  it('should parse command line arguments', () => {
    // Set up mock argv
    process.argv = ['node', 'src/index.js', 'init'];
    
    // Execute the index file
    require('../index');
    
    // Verify parse is called with argv
    expect(mockProgram.parse).toHaveBeenCalledWith(process.argv);
  });
  
  it('should output help if no arguments provided', () => {
    // Execute the index file
    require('../index');
    
    // Verify outputHelp is called
    expect(mockProgram.outputHelp).toHaveBeenCalled();
  });
}); 