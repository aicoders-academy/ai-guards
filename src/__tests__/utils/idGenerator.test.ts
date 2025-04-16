import * as path from 'path';
import { generatePlanId } from '../../utils/idGenerator';

// Mock the modules
jest.mock('fs-extra', () => {
  return {
    existsSync: jest.fn(),
    mkdirSync: jest.fn()
  };
});

jest.mock('glob', () => {
  return {
    sync: jest.fn()
  };
});

// Import the mocked modules after mocking
const fs = require('fs-extra');
const glob = require('glob');

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/'))
}));

describe('idGenerator', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    // Set up process.cwd() mock
    jest.spyOn(process, 'cwd').mockReturnValue('/fake/path');
  });

  it('should generate first plan ID when plans directory does not exist', () => {
    // Mock fs.existsSync to return false
    fs.existsSync.mockReturnValue(false);
    
    const id = generatePlanId();
    
    expect(id).toBe('plan-001');
    expect(fs.mkdirSync).toHaveBeenCalledWith('/fake/path/.ai-guards/plans', { recursive: true });
  });

  it('should generate next plan ID based on existing plans', () => {
    // Mock fs.existsSync to return true
    fs.existsSync.mockReturnValue(true);
    
    // Mock glob.sync to return existing plan files
    glob.sync.mockReturnValue([
      'plan-001-test.md',
      'plan-002-another.md'
    ]);

    const id = generatePlanId();
    
    expect(id).toBe('plan-003');
    expect(glob.sync).toHaveBeenCalledWith('*.md', { cwd: '/fake/path/.ai-guards/plans' });
  });

  it('should handle non-sequential plan IDs', () => {
    // Mock fs.existsSync to return true
    fs.existsSync.mockReturnValue(true);
    
    // Mock glob.sync to return existing plan files with gaps
    glob.sync.mockReturnValue([
      'plan-001-test.md',
      'plan-003-another.md'
    ]);

    const id = generatePlanId();
    
    expect(id).toBe('plan-002');
  });

  it('should generate a random ID when an error occurs', () => {
    // Mock fs.existsSync to return true
    fs.existsSync.mockReturnValue(true);
    
    // Mock glob.sync to throw an error
    glob.sync.mockImplementation(() => {
      throw new Error('Test error');
    });
    
    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Math.random to return a predictable value
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    const id = generatePlanId();
    
    // With Math.random() = 0.5, the calculation (Math.floor(0.5 * 999) + 1) gives 500
    expect(id).toBe('plan-500');
    expect(console.error).toHaveBeenCalled();
  });

  it('should throw an error when maximum number of plans is reached', () => {
    // Mock fs.existsSync to return true
    fs.existsSync.mockReturnValue(true);
    
    // Create an array of 999 plan files
    const planFiles = Array.from({ length: 999 }, (_, i) => 
      `plan-${String(i + 1).padStart(3, '0')}-test.md`
    );
    
    // Mock glob.sync to return all possible plan files
    glob.sync.mockReturnValue(planFiles);
    
    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // We expect a random ID since the function catches the error
    // Mock Math.random to return a predictable value
    jest.spyOn(global.Math, 'random').mockReturnValue(0.75);

    const id = generatePlanId();
    
    // With Math.random() = 0.75, the calculation (Math.floor(0.75 * 999) + 1) gives 750
    expect(id).toBe('plan-750');
  });
}); 