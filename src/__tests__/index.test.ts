// Define mock command and mocked functions
const mockName = jest.fn().mockReturnThis();
const mockDescription = jest.fn().mockReturnThis();
const mockVersion = jest.fn().mockReturnThis();
const mockParse = jest.fn();
const mockOutputHelp = jest.fn();

// Mock initCommand and planCommand
const mockInitCommand = jest.fn();
const mockPlanCommand = jest.fn();

// Mock commander
jest.mock('commander', () => {
  return {
    Command: jest.fn().mockImplementation(() => {
      return {
        name: mockName,
        description: mockDescription,
        version: mockVersion,
        parse: mockParse,
        outputHelp: mockOutputHelp,
      };
    })
  };
});

// Mock the commands
jest.mock('../commands/init', () => mockInitCommand);
jest.mock('../commands/plan', () => mockPlanCommand);

describe('CLI Entry Point', () => {
  let originalArgv: string[];
  
  beforeEach(() => {
    jest.resetModules();
    originalArgv = process.argv;
    
    // Reset the mock functions
    mockName.mockClear();
    mockDescription.mockClear();
    mockVersion.mockClear();
    mockParse.mockClear();
    mockOutputHelp.mockClear();
    mockInitCommand.mockClear();
    mockPlanCommand.mockClear();
  });
  
  afterEach(() => {
    process.argv = originalArgv;
  });
  
  it('should create a new command with correct metadata', () => {
    // Set up process.argv
    process.argv = ['node', 'src/index.js', 'init'];
    
    // Import the index module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Verify commander setup
    expect(mockName).toHaveBeenCalledWith('ai-guards');
    expect(mockDescription).toHaveBeenCalledWith(
      'Standardize how teams plan, review, execute, and verify AI‑assisted code'
    );
    expect(mockVersion).toHaveBeenCalled();
  });
  
  it('should register all commands', () => {
    // Set up process.argv
    process.argv = ['node', 'src/index.js', 'init'];
    
    // Import the module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Verify command registration
    expect(mockInitCommand).toHaveBeenCalled();
    expect(mockPlanCommand).toHaveBeenCalled();
    
    // Verify arguments were parsed
    expect(mockParse).toHaveBeenCalledWith(process.argv);
  });
  
  it('should show help if no arguments provided', () => {
    // Set up process.argv with no command
    process.argv = ['node', 'src/index.js'];
    
    // Import the module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Verify help output
    expect(mockOutputHelp).toHaveBeenCalled();
  });
}); 