import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  getAiGuardsDir,
  getTemplatesDir,
  getTemplatesConfigPath,
  loadTemplatesConfig,
  saveTemplatesConfig,
  loadTemplateRegistry,
  isTemplateInstalled,
  initTemplates
} from '../utils/template-manager';

// Mock fs-extra
jest.mock('fs-extra');
// Mock process.cwd()
jest.spyOn(process, 'cwd').mockReturnValue('/fake/project/path');

describe('Template Manager Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Path Functions', () => {
    it('should return correct AI Guards directory path', () => {
      const aiGuardsDir = getAiGuardsDir();
      expect(aiGuardsDir).toBe('/fake/project/path/.ai-guards');
    });

    it('should return correct templates directory path', () => {
      const templatesDir = getTemplatesDir();
      expect(templatesDir).toBe('/fake/project/path/.ai-guards/templates');
    });

    it('should return correct templates config path', () => {
      const templatesConfigPath = getTemplatesConfigPath();
      expect(templatesConfigPath).toBe('/fake/project/path/.ai-guards/templates/templates.json');
    });
  });

  describe('Config Functions', () => {
    it('should return empty templates object when config does not exist', async () => {
      (fs.pathExists as jest.Mock).mockResolvedValue(false);
      
      const config = await loadTemplatesConfig();
      expect(config).toEqual({ 
        templates: {},
        config: {
          defaultCategory: 'guidelines'
        }
      });
    });

    it('should load config from file when it exists', async () => {
      const mockConfig = { 
        version: 1,
        rules: [],
        templates: { 
          'test-template': { 
            id: 'test-template',
            name: 'Test Template',
            description: 'Test description',
            category: 'test',
            path: 'test.md',
            installedAt: '2020-01-01T00:00:00.000Z'
          } 
        },
        config: {
          defaultCategory: 'guidelines'
        }
      };
      
      (fs.pathExists as jest.Mock).mockResolvedValue(true);
      (fs.readJson as jest.Mock).mockResolvedValue(mockConfig);
      
      const config = await loadTemplatesConfig();
      expect(config).toEqual({
        templates: mockConfig.templates,
        config: mockConfig.config
      });
    });

    it('should save config to file', async () => {
      const mockConfig = { 
        templates: {},
        config: {
          defaultCategory: 'guidelines'
        }
      };
      
      // Mock the loadConfig to return a complete config
      const mockFullConfig = {
        version: 1,
        rules: [],
        templates: {},
        config: {
          defaultCategory: 'guidelines'
        }
      };
      (fs.readJson as jest.Mock).mockResolvedValue(mockFullConfig);
      
      await saveTemplatesConfig(mockConfig);
      
      expect(fs.writeJson).toHaveBeenCalledWith(
        '/fake/project/path/ai-guards.json.tmp',
        {
          version: 1,
          rules: [],
          templates: {},
          config: {
            defaultCategory: 'guidelines'
          }
        },
        { spaces: 2 }
      );
    });
  });

  describe('Template Registry', () => {
    it('should load template registry from file', async () => {
      const mockRegistry = {
        templates: {
          'test-template': {
            id: 'test-template',
            name: 'Test Template',
            description: 'Test description',
            category: 'test',
            path: 'test.md'
          }
        },
        categories: {
          test: {
            name: 'Test',
            description: 'Test category'
          }
        }
      };
      
      (fs.readJson as jest.Mock).mockResolvedValue(mockRegistry);
      
      const registry = await loadTemplateRegistry();
      expect(registry).toEqual(mockRegistry);
    });
  });

  describe('Template Operations', () => {
    it('should check if template is installed', async () => {
      const mockConfig = { 
        version: 1,
        rules: [],
        templates: { 
          'test-template': { 
            id: 'test-template',
            name: 'Test Template',
            description: 'Test description',
            category: 'test',
            path: 'test.md',
            installedAt: '2020-01-01T00:00:00.000Z'
          } 
        },
        config: {
          defaultCategory: 'guidelines'
        }
      };
      
      (fs.pathExists as jest.Mock).mockResolvedValue(true);
      (fs.readJson as jest.Mock).mockResolvedValue(mockConfig);
      
      const isInstalled = await isTemplateInstalled('test-template');
      expect(isInstalled).toBe(true);
      
      const isNotInstalled = await isTemplateInstalled('non-existent-template');
      expect(isNotInstalled).toBe(false);
    });

    it('should initialize templates directory and config', async () => {
      await initTemplates(false);
      
      expect(fs.ensureDir).toHaveBeenCalledWith('/fake/project/path/.ai-guards/templates');
      expect(fs.pathExists).toHaveBeenCalledWith('/fake/project/path/ai-guards.json');
    });
  });
}); 