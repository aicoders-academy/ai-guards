import { Command } from 'commander';
import { version } from '../../package.json';

// Create mock for Commander
jest.mock('commander', () => {
  const mockCommand = {
    name: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    action: jest.fn().mockReturnThis(),
    command: jest.fn().mockImplementation(() => {
      return {
        description: jest.fn().mockReturnThis(),
        option: jest.fn().mockReturnThis(),
        action: jest.fn().mockReturnThis(),
        command: jest.fn().mockImplementation(() => {
          return {
            description: jest.fn().mockReturnThis(),
            option: jest.fn().mockReturnThis(),
            action: jest.fn().mockReturnThis(),
            argument: jest.fn().mockReturnThis()
          };
        })
      };
    }),
    parse: jest.fn(),
    outputHelp: jest.fn()
  };

  return {
    Command: jest.fn().mockImplementation(() => mockCommand)
  };
});

// Mock command modules
jest.mock('../commands/init', () => jest.fn());
jest.mock('../commands/plan', () => jest.fn());
jest.mock('../commands/add', () => jest.fn());
jest.mock('../commands/rules', () => jest.fn());

// Import modules after mocking
import initCommand from '../commands/init';
import planCommand from '../commands/plan';
import addCommand from '../commands/add';
import rulesCommand from '../commands/rules';

describe('CLI Entry Point', () => {
  let program: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reinitialize the imported program
    jest.isolateModules(() => {
      program = new Command();
    });
  });

  it('should initialize the CLI with correct information', () => {
    // Import the index module to trigger CLI initialization
    jest.isolateModules(() => {
      require('../index');
    });

    // Verify CLI was set up correctly
    expect(program.name).toHaveBeenCalledWith('ai-guards');
    expect(program.description).toHaveBeenCalledWith(
      'Standardize how teams plan, review, execute, and verify AI‑assisted code'
    );
    expect(program.version).toHaveBeenCalledWith(version);
  });

  it('should register all commands', () => {
    // Import the index module to trigger command registration
    jest.isolateModules(() => {
      require('../index');
    });

    // Verify all commands were registered
    expect(initCommand).toHaveBeenCalled();
    expect(planCommand).toHaveBeenCalled();
    expect(addCommand).toHaveBeenCalled();
    expect(rulesCommand).toHaveBeenCalled();
  });

  it('should parse command line arguments', () => {
    // Import the index module to trigger CLI initialization
    jest.isolateModules(() => {
      require('../index');
    });

    // Verify parse was called
    expect(program.parse).toHaveBeenCalledWith(process.argv);
  });

  it('should output help if no arguments provided', () => {
    // Mock process.argv to simulate no arguments
    const originalArgv = process.argv;
    process.argv = ['node', 'index.js'];

    // Import the index module with mocked argv
    jest.isolateModules(() => {
      require('../index');
    });

    // Verify outputHelp was called
    expect(program.outputHelp).toHaveBeenCalled();

    // Restore original argv
    process.argv = originalArgv;
  });
}); 