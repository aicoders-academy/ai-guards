import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import {
  loadRegistry,
  saveRegistry,
  extractRuleMeta,
  addRule,
  syncRegistry,
  RuleRegistry,
  RuleMeta
} from '../utils/registry-manager';

// Mock fs-extra
jest.mock('fs-extra');
const mockFS = fs as jest.Mocked<typeof fs>;

// Mock glob
jest.mock('glob');
const mockGlob = glob as jest.Mocked<typeof glob>;

describe('Registry Manager', () => {
  const testRegistry: RuleRegistry = {
    version: 1,
    rules: [
      {
        id: 'test-rule',
        path: '.ai-guards/rules/guidelines/test-rule.md',
        ruleType: 'auto-attached',
        description: 'Test rule',
        globs: ['**/*.ts'],
        fileExtensions: ['.ts'],
        alwaysApply: false
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.cwd() to return a consistent value
    jest.spyOn(process, 'cwd').mockReturnValue('/test-project');
  });

  describe('loadRegistry', () => {
    it('should load registry from file if it exists', async () => {
      mockFS.pathExists.mockResolvedValue(true);
      mockFS.readJson.mockResolvedValue(testRegistry);

      const result = await loadRegistry();
      expect(result).toEqual(testRegistry);
      expect(mockFS.pathExists).toHaveBeenCalledWith('/test-project/ai-guards.json');
      expect(mockFS.readJson).toHaveBeenCalledWith('/test-project/ai-guards.json');
    });

    it('should return empty registry if file does not exist', async () => {
      mockFS.pathExists.mockResolvedValue(false);

      const result = await loadRegistry();
      expect(result).toEqual({ version: 1, rules: [] });
      expect(mockFS.readJson).not.toHaveBeenCalled();
    });

    it('should return empty registry if file is invalid', async () => {
      mockFS.pathExists.mockResolvedValue(true);
      mockFS.readJson.mockResolvedValue({ version: 2, invalid: true });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await loadRegistry();
      expect(result).toEqual({ version: 1, rules: [] });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveRegistry', () => {
    it('should write registry to temp file and rename', async () => {
      await saveRegistry(testRegistry);

      expect(mockFS.writeJson).toHaveBeenCalledWith(
        '/test-project/ai-guards.json.tmp',
        testRegistry,
        { spaces: 2 }
      );
      expect(mockFS.move).toHaveBeenCalledWith(
        '/test-project/ai-guards.json.tmp',
        '/test-project/ai-guards.json',
        { overwrite: true }
      );
    });
  });

  describe('extractRuleMeta', () => {
    it('should parse front matter and extract rule metadata', async () => {
      const testContent = `---
description: Test rule
globs: **/*.ts
alwaysApply: false
---

This is a test rule.
`;
      mockFS.readFile.mockResolvedValue(testContent);

      const result = await extractRuleMeta('/test-project/.ai-guards/rules/guidelines/test-rule.md');
      expect(result).toEqual(expect.objectContaining({
        id: 'test-rule',
        ruleType: 'auto-attached',
        description: 'Test rule',
        fileExtensions: ['.ts']
      }));
    });

    it('should handle missing front matter', async () => {
      const testContent = 'This is a test rule without front matter.';
      mockFS.readFile.mockResolvedValue(testContent);

      const result = await extractRuleMeta('/test-project/.ai-guards/rules/guidelines/test-rule.md');
      expect(result).toEqual(expect.objectContaining({
        id: 'test-rule',
        ruleType: 'manual', // Default type for no globs/always
        description: undefined,
        globs: undefined
      }));
    });

    it('should correctly set rule type based on front matter', async () => {
      // Test 'always' rule type
      mockFS.readFile.mockResolvedValue(`---
alwaysApply: true
---
`);
      const alwaysResult = await extractRuleMeta('/test-project/.ai-guards/rules/guidelines/always-rule.md');
      expect(alwaysResult.ruleType).toBe('always');

      // Test 'auto-attached' rule type
      mockFS.readFile.mockResolvedValue(`---
globs: **/*.js
---
`);
      const autoResult = await extractRuleMeta('/test-project/.ai-guards/rules/guidelines/auto-rule.md');
      expect(autoResult.ruleType).toBe('auto-attached');

      // Test 'manual' rule type (default)
      mockFS.readFile.mockResolvedValue(`---
description: Manual rule
---
`);
      const manualResult = await extractRuleMeta('/test-project/.ai-guards/rules/guidelines/manual-rule.md');
      expect(manualResult.ruleType).toBe('manual');
    });
  });

  describe('addRule', () => {
    it('should add new rule to registry', async () => {
      // Mock existing registry
      const existingRegistry = { version: 1, rules: [] };
      mockFS.pathExists.mockResolvedValue(true);
      mockFS.readJson.mockResolvedValue(existingRegistry);

      // Mock rule metadata extraction
      const ruleMeta: RuleMeta = {
        id: 'new-rule',
        path: '.ai-guards/rules/guidelines/new-rule.md',
        ruleType: 'manual',
        description: 'New test rule'
      };
      jest.spyOn(require('../utils/registry-manager'), 'extractRuleMeta').mockResolvedValue(ruleMeta);

      await addRule('/test-project/.ai-guards/rules/guidelines/new-rule.md');

      // Verify registry was updated and saved
      expect(mockFS.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        { version: 1, rules: [ruleMeta] },
        expect.any(Object)
      );
    });

    it('should update existing rule in registry', async () => {
      // Mock existing registry with a rule
      const existingRule = {
        id: 'existing-rule',
        path: '.ai-guards/rules/guidelines/existing-rule.md',
        ruleType: 'manual',
        description: 'Old description'
      };
      const existingRegistry = { version: 1, rules: [existingRule] };
      
      mockFS.pathExists.mockResolvedValue(true);
      mockFS.readJson.mockResolvedValue(existingRegistry);

      // Mock updated rule metadata
      const updatedRule = {
        ...existingRule,
        description: 'Updated description',
        ruleType: 'auto-attached',
        globs: ['**/*.js']
      };
      jest.spyOn(require('../utils/registry-manager'), 'extractRuleMeta').mockResolvedValue(updatedRule);

      await addRule('/test-project/.ai-guards/rules/guidelines/existing-rule.md');

      // Verify registry was updated with the new rule metadata
      expect(mockFS.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        { version: 1, rules: [updatedRule] },
        expect.any(Object)
      );
    });
  });

  describe('syncRegistry', () => {
    it('should rebuild registry from all rules found', async () => {
      // Mock glob to return two rule files
      mockGlob.sync.mockReturnValue([
        '/test-project/.ai-guards/rules/guidelines/rule1.md',
        '/test-project/.ai-guards/rules/security/rule2.md'
      ]);

      // Mock rule metadata extraction
      const rule1: RuleMeta = {
        id: 'rule1',
        path: '.ai-guards/rules/guidelines/rule1.md',
        ruleType: 'auto-attached',
        globs: ['**/*.ts']
      };
      
      const rule2: RuleMeta = {
        id: 'rule2',
        path: '.ai-guards/rules/security/rule2.md',
        ruleType: 'always',
        alwaysApply: true
      };

      const extractRuleMeta = jest.spyOn(require('../utils/registry-manager'), 'extractRuleMeta');
      extractRuleMeta
        .mockResolvedValueOnce(rule1)
        .mockResolvedValueOnce(rule2);

      await syncRegistry();

      // Verify registry was updated with both rules
      expect(mockFS.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        { version: 1, rules: [rule1, rule2] },
        expect.any(Object)
      );
    });

    it('should handle errors during rule extraction', async () => {
      // Mock glob to return a rule file
      mockGlob.sync.mockReturnValue([
        '/test-project/.ai-guards/rules/guidelines/bad-rule.md'
      ]);

      // Mock rule metadata extraction to throw error
      const extractRuleMeta = jest.spyOn(require('../utils/registry-manager'), 'extractRuleMeta');
      extractRuleMeta.mockRejectedValue(new Error('Invalid front matter'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await syncRegistry();

      // Verify error was logged and empty registry was saved
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockFS.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        { version: 1, rules: [] },
        expect.any(Object)
      );
    });
  });
}); 