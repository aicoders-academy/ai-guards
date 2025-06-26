import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  findPlansDirectory, 
  findProjectRoot, 
  getDefaultPlansPath, 
  isProjectInitialized 
} from '../../utils/plansUtils';

// Mock fs-extra
jest.mock('fs-extra');

describe('plansUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findPlansDirectory', () => {
    it('should find .ai-guards-config custom folder', async () => {
      (fs.pathExists as jest.Mock)
        .mockResolvedValueOnce(true)  // .ai-guards-config exists
        .mockResolvedValueOnce(true); // custom folder exists
      (fs.readFile as jest.Mock).mockResolvedValue('my-plans');

      const result = await findPlansDirectory('/test');
      
      expect(result).toBe('/test/my-plans');
      expect(fs.readFile).toHaveBeenCalledWith('/test/.ai-guards-config', 'utf-8');
    });

    it('should find .plans directory', async () => {
      (fs.pathExists as jest.Mock)
        .mockResolvedValueOnce(false) // no config file
        .mockResolvedValueOnce(true)  // .plans exists
        .mockResolvedValueOnce(false); // no legacy format

      const result = await findPlansDirectory('/test');
      
      expect(result).toBe('/test/.plans');
    });

    it('should find legacy .ai-guards/plans directory', async () => {
      (fs.pathExists as jest.Mock).mockImplementation((path: string) => {
        if (path === '/test/.ai-guards-config') return Promise.resolve(false); // no config file
        if (path === '/test/.plans') return Promise.resolve(false); // no .plans
        if (path === '/test/.ai-guards/plans') return Promise.resolve(true); // legacy format exists
        return Promise.resolve(false);
      });

      const result = await findPlansDirectory('/test');
      
      expect(result).toBe('/test/.ai-guards/plans');
    });

    it('should return null if no plans directory found', async () => {
      (fs.pathExists as jest.Mock).mockResolvedValue(false);

      const result = await findPlansDirectory('/test');
      
      expect(result).toBeNull();
    });
  });

  describe('getDefaultPlansPath', () => {
    it('should return custom folder path when provided', () => {
      const result = getDefaultPlansPath('/test', 'my-plans');
      expect(result).toBe('/test/my-plans');
    });

    it('should return default .plans path when no folder provided', () => {
      const result = getDefaultPlansPath('/test');
      expect(result).toBe('/test/.plans');
    });
  });

  describe('isProjectInitialized', () => {
    it('should return true for custom folder configuration', async () => {
      (fs.pathExists as jest.Mock)
        .mockResolvedValueOnce(true)  // config file exists
        .mockResolvedValueOnce(true); // custom folder exists
      (fs.readFile as jest.Mock).mockResolvedValue('my-plans');

      const result = await isProjectInitialized('/test');
      
      expect(result).toBe(true);
    });

    it('should return true for .plans directory', async () => {
      (fs.pathExists as jest.Mock)
        .mockResolvedValueOnce(false) // no config file
        .mockResolvedValueOnce(true)  // .plans exists
        .mockResolvedValueOnce(false); // no legacy

      const result = await isProjectInitialized('/test');
      
      expect(result).toBe(true);
    });

    it('should return true for legacy .ai-guards directory', async () => {
      (fs.pathExists as jest.Mock)
        .mockResolvedValueOnce(false) // no config file
        .mockResolvedValueOnce(false) // no .plans
        .mockResolvedValueOnce(true); // legacy exists

      const result = await isProjectInitialized('/test');
      
      expect(result).toBe(true);
    });

    it('should return false when not initialized', async () => {
      (fs.pathExists as jest.Mock).mockResolvedValue(false);

      const result = await isProjectInitialized('/test');
      
      expect(result).toBe(false);
    });
  });
});