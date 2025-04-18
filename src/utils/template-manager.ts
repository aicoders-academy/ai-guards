import * as fs from 'fs-extra';
import * as path from 'path';
import {
  loadConfig,
  updateTemplate,
  removeTemplate,
  ensureConfigExists,
  Template
} from './config-manager';

// Re-export Template types from config-manager for backward compatibility
export type { Template };

// Legacy type definitions
interface TemplateConfig {
  templates: Record<string, Template>;
  config?: {
    defaultCategory?: string;
    customTemplatesPath?: string;
  };
}

interface TemplateRegistry {
  templates: Record<string, Template>;
  categories: Record<string, {
    name: string;
    description: string;
  }>;
}

// Constants
const AI_GUARDS_DIR = '.ai-guards';
const TEMPLATES_CONFIG_FILE = 'templates.json';

/**
 * Get the path to the AI Guards directory
 */
export function getAiGuardsDir(): string {
  return path.join(process.cwd(), AI_GUARDS_DIR);
}

/**
 * Get the path to the templates directory
 */
export function getTemplatesDir(): string {
  return path.join(getAiGuardsDir(), 'templates');
}

/**
 * Get the path to the templates config file (legacy)
 */
export function getTemplatesConfigPath(): string {
  return path.join(getTemplatesDir(), TEMPLATES_CONFIG_FILE);
}

/**
 * Load the templates config (now uses unified config)
 */
export async function loadTemplatesConfig(): Promise<TemplateConfig> {
  const config = await loadConfig();
  
  // Return in format expected by legacy code
  return {
    templates: config.templates,
    config: config.config
  };
}

/**
 * Save the templates config (now uses unified config)
 */
export async function saveTemplatesConfig(templateConfig: TemplateConfig): Promise<void> {
  const cfg = await loadConfig();
  cfg.templates = templateConfig.templates;
  if (templateConfig.config) {
    cfg.config = templateConfig.config;
  }
  const { saveConfig } = require('./config-manager');
  await saveConfig(cfg);
}

/**
 * Load the template registry
 */
export async function loadTemplateRegistry(): Promise<TemplateRegistry> {
  const registryPath = path.join(__dirname, '..', 'templates', 'registry.json');
  
  try {
    const registry = await fs.readJson(registryPath);
    return registry;
  } catch (error) {
    console.error('Error loading template registry:', error);
    throw error;
  }
}

/**
 * Get a list of all available templates from the registry
 */
export async function getAvailableTemplates(): Promise<Template[]> {
  const registry = await loadTemplateRegistry();
  return Object.values(registry.templates);
}

/**
 * Get a list of all installed templates
 */
export async function getInstalledTemplates(): Promise<Template[]> {
  const config = await loadConfig();
  return Object.values(config.templates);
}

/**
 * Check if a template is installed
 */
export async function isTemplateInstalled(templateId: string): Promise<boolean> {
  const config = await loadConfig();
  return !!config.templates[templateId];
}

/**
 * Install a template (now uses unified config)
 */
export async function installTemplate(templateId: string): Promise<void> {
  // Get the template from the registry
  const registry = await loadTemplateRegistry();
  const template = registry.templates[templateId];
  
  if (!template) {
    throw new Error(`Template "${templateId}" not found in registry`);
  }
  
  // Check if template is already installed
  if (await isTemplateInstalled(templateId)) {
    throw new Error(`Template "${templateId}" is already installed`);
  }
  
  // Copy the template file to the templates directory
  const sourceTemplatePath = path.join(__dirname, '../templates', template.path);
  const destTemplatePath = path.join(getTemplatesDir(), template.path);
  
  await fs.copy(sourceTemplatePath, destTemplatePath);
  
  // Update the unified config
  await updateTemplate({
    ...template,
    installedAt: new Date().toISOString(),
    customized: false
  });
}

/**
 * Uninstall a template (now uses unified config)
 */
export async function uninstallTemplate(templateId: string): Promise<void> {
  // Check if template is installed
  const config = await loadConfig();
  const template = config.templates[templateId];
  
  if (!template) {
    throw new Error(`Template "${templateId}" is not installed`);
  }
  
  // Remove the template file
  const templatePath = path.join(getTemplatesDir(), template.path);
  
  if (await fs.pathExists(templatePath)) {
    await fs.remove(templatePath);
  }
  
  // Update the unified config
  await removeTemplate(templateId);
}

/**
 * Get template categories from registry
 */
export async function getTemplateCategories(): Promise<Record<string, { name: string; description: string }>> {
  const registry = await loadTemplateRegistry();
  return registry.categories;
}

/**
 * Initialize templates directory and config (now uses unified config)
 */
export async function initTemplates(installAll = false): Promise<void> {
  const templatesDir = getTemplatesDir();
  await fs.ensureDir(templatesDir);
  
  // Ensure the unified config exists
  await ensureConfigExists();
  
  // Install all templates if requested
  if (installAll) {
    const templates = await getAvailableTemplates();
    for (const template of templates) {
      try {
        await installTemplate(template.id);
      } catch (error) {
        console.error(`Error installing template "${template.id}":`, error);
      }
    }
  }
} 