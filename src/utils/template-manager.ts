import * as fs from 'fs-extra';
import * as path from 'path';

// Types
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  installedAt?: string;
  customized?: boolean;
}

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
 * Get the path to the templates config file
 */
export function getTemplatesConfigPath(): string {
  return path.join(getTemplatesDir(), TEMPLATES_CONFIG_FILE);
}

/**
 * Load the templates config
 */
export async function loadTemplatesConfig(): Promise<TemplateConfig> {
  const configPath = getTemplatesConfigPath();
  
  if (!await fs.pathExists(configPath)) {
    return { templates: {} };
  }
  
  try {
    const config = await fs.readJson(configPath);
    return config;
  } catch (error) {
    console.error('Error loading templates config:', error);
    return { templates: {} };
  }
}

/**
 * Save the templates config
 */
export async function saveTemplatesConfig(config: TemplateConfig): Promise<void> {
  const configPath = getTemplatesConfigPath();
  
  try {
    await fs.writeJson(configPath, config, { spaces: 2 });
  } catch (error) {
    console.error('Error saving templates config:', error);
    throw error;
  }
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
  const config = await loadTemplatesConfig();
  return Object.values(config.templates);
}

/**
 * Check if a template is installed
 */
export async function isTemplateInstalled(templateId: string): Promise<boolean> {
  const config = await loadTemplatesConfig();
  return !!config.templates[templateId];
}

/**
 * Install a template
 */
export async function installTemplate(templateId: string): Promise<void> {
  // Get the template from the registry
  const registry = await loadTemplateRegistry();
  const template = registry.templates[templateId];
  
  if (!template) {
    throw new Error(`Template "${templateId}" not found in registry`);
  }
  
  // Check if template is already installed
  const config = await loadTemplatesConfig();
  if (config.templates[templateId]) {
    throw new Error(`Template "${templateId}" is already installed`);
  }
  
  // Copy the template file to the templates directory
  const sourceTemplatePath = path.join(__dirname, '../templates', template.path);
  const destTemplatePath = path.join(getTemplatesDir(), template.path);
  
  await fs.copy(sourceTemplatePath, destTemplatePath);
  
  // Update the templates config
  config.templates[templateId] = {
    ...template,
    installedAt: new Date().toISOString(),
    customized: false
  };
  
  await saveTemplatesConfig(config);
}

/**
 * Uninstall a template
 */
export async function uninstallTemplate(templateId: string): Promise<void> {
  // Check if template is installed
  const config = await loadTemplatesConfig();
  const template = config.templates[templateId];
  
  if (!template) {
    throw new Error(`Template "${templateId}" is not installed`);
  }
  
  // Remove the template file
  const templatePath = path.join(getTemplatesDir(), template.path);
  
  if (await fs.pathExists(templatePath)) {
    await fs.remove(templatePath);
  }
  
  // Update the templates config
  delete config.templates[templateId];
  await saveTemplatesConfig(config);
}

/**
 * Get template categories from registry
 */
export async function getTemplateCategories(): Promise<Record<string, { name: string; description: string }>> {
  const registry = await loadTemplateRegistry();
  return registry.categories;
}

/**
 * Initialize templates directory and config
 */
export async function initTemplates(installAll = false): Promise<void> {
  const templatesDir = getTemplatesDir();
  await fs.ensureDir(templatesDir);
  
  // Create initial config if it doesn't exist
  const configPath = getTemplatesConfigPath();
  if (!await fs.pathExists(configPath)) {
    await saveTemplatesConfig({ templates: {} });
  }
  
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