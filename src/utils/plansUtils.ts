import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Find the plans directory in a project
 * Supports both new format (.plans), legacy format (.ai-guards/plans), and custom folder names
 */
export async function findPlansDirectory(startPath: string = process.cwd()): Promise<string | null> {
  let currentPath = startPath;
  
  // Check up to 10 parent directories
  for (let i = 0; i < 10; i++) {
    // Check for config file that stores custom folder name
    const configPath = path.join(currentPath, '.ai-guards-config');
    if (await fs.pathExists(configPath)) {
      try {
        const config = await fs.readFile(configPath, 'utf-8');
        const folderName = config.trim();
        const customPlansPath = path.join(currentPath, folderName);
        if (await fs.pathExists(customPlansPath)) {
          return customPlansPath;
        }
      } catch (error) {
        // Ignore config file read errors
      }
    }
    
    // Check for new format (.plans)
    const newFormatPath = path.join(currentPath, '.plans');
    if (await fs.pathExists(newFormatPath)) {
      return newFormatPath;
    }
    
    // Check for legacy format (.ai-guards/plans)
    const legacyFormatPath = path.join(currentPath, '.ai-guards', 'plans');
    if (await fs.pathExists(legacyFormatPath)) {
      return legacyFormatPath;
    }
    
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      // Reached the root of the filesystem
      break;
    }
    currentPath = parentPath;
  }
  
  return null;
}

/**
 * Get the project root directory by looking for plans directory
 */
export async function findProjectRoot(startPath: string = process.cwd()): Promise<string | null> {
  let currentPath = startPath;
  
  // Check up to 10 parent directories
  for (let i = 0; i < 10; i++) {
    // Check for new format (.plans)
    if (await fs.pathExists(path.join(currentPath, '.plans'))) {
      return currentPath;
    }
    
    // Check for legacy format (.ai-guards)
    if (await fs.pathExists(path.join(currentPath, '.ai-guards'))) {
      return currentPath;
    }
    
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      break;
    }
    currentPath = parentPath;
  }
  
  return null;
}

/**
 * Get the default plans directory path for initialization
 */
export function getDefaultPlansPath(projectRoot: string, folderName?: string): string {
  if (folderName) {
    return path.join(projectRoot, folderName);
  }
  return path.join(projectRoot, '.plans');
}

/**
 * Check if a project is already initialized with AI Guards
 */
export async function isProjectInitialized(projectRoot: string = process.cwd()): Promise<boolean> {
  // Check for config file (custom folder)
  const configPath = path.join(projectRoot, '.ai-guards-config');
  if (await fs.pathExists(configPath)) {
    try {
      const folderName = (await fs.readFile(configPath, 'utf-8')).trim();
      const customPath = path.join(projectRoot, folderName);
      if (await fs.pathExists(customPath)) {
        return true;
      }
    } catch (error) {
      // Ignore config read errors
    }
  }
  
  // Check for standard formats
  const newFormat = await fs.pathExists(path.join(projectRoot, '.plans'));
  const legacyFormat = await fs.pathExists(path.join(projectRoot, '.ai-guards'));
  
  return newFormat || legacyFormat;
}