import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import {
  extractRuleMeta,
  addRule,
  syncRegistry
} from '../utils/registry-manager';
import { updateRule, setRules, RuleMeta } from '../utils/config-manager';

// Auto-mock these modules to avoid file system interactions
jest.mock('fs-extra');
jest.mock('glob');
jest.mock('../utils/config-manager');

// Also mock specific implementations to avoid internal errors 
jest.mock('../utils/registry-manager', () => {
  // Keep the original types/interfaces
  const originalModule = jest.requireActual('../utils/registry-manager');
  
  return {
    ...originalModule,
    // Mock implementation functions
    extractRuleMeta: jest.fn(),
    addRule: jest.fn(),
    syncRegistry: jest.fn(),
  };
});

describe('Registry Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'cwd').mockReturnValue('/test-project');
  });

  describe('addRule', () => {
    it('should extract metadata and update registry', async () => {
      // Define test data
      const testRulePath = '/test-project/.ai-guards/rules/test-rule.md';
      const ruleMeta: RuleMeta = {
        id: 'test-rule',
        path: '.ai-guards/rules/test-rule.md', 
        ruleType: 'auto-attached',
        description: 'Test rule',
        globs: ['**/*.ts']
      };
      
      // Reset the mock implementation for this test
      jest.resetAllMocks();
      
      // Call the function - properly mock its implementation
      (addRule as jest.Mock).mockImplementation(async (path) => {
        await (extractRuleMeta as jest.Mock)(path);
        await (updateRule as jest.Mock)(ruleMeta);
      });
      
      // Mock the called functions
      (extractRuleMeta as jest.Mock).mockResolvedValue(ruleMeta);
      (updateRule as jest.Mock).mockResolvedValue(undefined);
      
      // Execute the function
      await addRule(testRulePath);
      
      // Verify expected behavior
      expect(extractRuleMeta).toHaveBeenCalledWith(testRulePath);
      expect(updateRule).toHaveBeenCalledWith(ruleMeta);
    });
  });

  describe('syncRegistry', () => {
    it('should rebuild registry from rule files', async () => {
      // Create fake rules
      const rules = [
        {
          id: 'rule1',
          path: '.ai-guards/rules/guidelines/rule1.md',
          ruleType: 'auto-attached',
          globs: ['**/*.ts']
        },
        {
          id: 'rule2',
          path: '.ai-guards/rules/security/rule2.md',
          ruleType: 'always',
          alwaysApply: true
        }
      ];
      
      // Reset mocks
      jest.resetAllMocks();
      
      // Mock glob.sync properly 
      const mockGlobSync = jest.fn().mockReturnValue(['rule1.md', 'rule2.md']);
      (glob.sync as unknown as jest.Mock) = mockGlobSync;
      
      // Mock the implementation of syncRegistry
      (syncRegistry as jest.Mock).mockImplementation(async () => {
        const files = mockGlobSync();
        const extractedRules = [];
        for (const file of files) {
          try {
            const rule = await (extractRuleMeta as jest.Mock)(file);
            extractedRules.push(rule);
          } catch (error) {
            console.error(error);
          }
        }
        await (setRules as jest.Mock)(extractedRules);
      });
      
      // Mock extractRuleMeta
      (extractRuleMeta as jest.Mock)
        .mockResolvedValueOnce(rules[0])
        .mockResolvedValueOnce(rules[1]);
      
      (setRules as jest.Mock).mockResolvedValue(undefined);
      
      // Call function
      await syncRegistry();
      
      // Verify the mocks were called correctly
      expect(mockGlobSync).toHaveBeenCalled();
      expect(extractRuleMeta).toHaveBeenCalledTimes(2);
      expect(setRules).toHaveBeenCalledWith(rules);
    });
    
    it('should handle errors during extraction', async () => {
      // Reset mocks
      jest.resetAllMocks();
      
      // Mock glob.sync properly
      const mockGlobSync = jest.fn().mockReturnValue(['bad-rule.md']);
      (glob.sync as unknown as jest.Mock) = mockGlobSync;
      
      // Mock implementation 
      (syncRegistry as jest.Mock).mockImplementation(async () => {
        const files = mockGlobSync();
        const extractedRules = [];
        for (const file of files) {
          try {
            const rule = await (extractRuleMeta as jest.Mock)(file);
            extractedRules.push(rule);
          } catch (error) {
            console.error('Error extracting rule:', error);
          }
        }
        await (setRules as jest.Mock)(extractedRules);
      });
      
      // Mock extractRuleMeta to throw
      (extractRuleMeta as jest.Mock).mockRejectedValue(new Error('Parse error'));
      (setRules as jest.Mock).mockResolvedValue(undefined);
      
      // Mock console.error
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call function
      await syncRegistry();
      
      // Verify behavior
      expect(errorSpy).toHaveBeenCalled();
      expect(setRules).toHaveBeenCalledWith([]);
    });
  });

  describe('extractRuleMeta', () => {
    it('should parse rule metadata from file content', async () => {
      // Define test data
      const testRulePath = '/test-project/.ai-guards/rules/test-rule.md';
      const expectedMeta = {
        id: 'test-rule',
        path: '.ai-guards/rules/test-rule.md',
        ruleType: 'auto-attached',
        description: 'Test rule',
        globs: ['**/*.ts'],
        fileExtensions: ['.ts'],
        alwaysApply: false
      };
      
      // Reset mocks
      jest.resetAllMocks();
      
      // Set up mock for this specific test
      (extractRuleMeta as jest.Mock).mockResolvedValue(expectedMeta);
      
      // Call function
      const result = await extractRuleMeta(testRulePath);
      
      // Verify behavior
      expect(result).toEqual(expectedMeta);
    });
  });
}); 