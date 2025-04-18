import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import { RuleType } from './registry-manager';

// ----------------------------
// Types & Validation Schema
// ----------------------------

// Rule section schema (moved from registry-manager.ts)
export interface RuleMeta {
  id: string;               // filename without extension
  path: string;             // project‑relative path
  ruleType: RuleType;       // derived from front‑matter or heuristics
  description?: string;     // from front‑matter
  globs?: string[];         // patterns for auto‑attached
  fileExtensions?: string[];// quick lookup keys
  alwaysApply?: boolean;    // from front‑matter
}

// Template section schema (from template-manager.ts)
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;             // project‑relative path
  installedAt?: string;     // ISO date string
  customized?: boolean;     // flag for template customization
}

// Unified config schema
export interface UnifiedConfig {
  version: 1;                 // new default version (unified)
  rules: RuleMeta[];        // Rules registry
  templates: Record<string, Template>; // Templates registry
  config?: {                // Global configuration options
    defaultCategory?: string;
    customTemplatesPath?: string;
  };
}

// ----------------------------
// Zod Schema
// ----------------------------

const ruleMetaSchema = z.object({
  id: z.string(),
  path: z.string(),
  ruleType: z.enum(['always', 'auto-attached', 'agent-requested', 'manual']),
  description: z.string().optional(),
  globs: z.array(z.string()).optional(),
  fileExtensions: z.array(z.string()).optional(),
  alwaysApply: z.boolean().optional()
});

const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  path: z.string(),
  installedAt: z.string().optional(),
  customized: z.boolean().optional()
});

const configSchema = z.object({
  version: z.literal(1),
  rules: z.array(ruleMetaSchema),
  templates: z.record(z.string(), templateSchema),
  config: z.object({
    defaultCategory: z.string().optional(),
    customTemplatesPath: z.string().optional()
  }).optional()
});

// ----------------------------
// Paths & Defaults
// ----------------------------

export function getConfigPath(): string {
  return path.join(process.cwd(), 'ai-guards.json');
}

const DEFAULT_CONFIG: UnifiedConfig = {
  version: 1,
  rules: [],
  templates: {},
  config: {
    defaultCategory: 'guidelines'
  }
};

// ----------------------------
// Core Helpers
// ----------------------------

/**
 * Load the unified configuration
 * - Attempts to load from ai-guards.json
 * - Verifies schema and defaults to empty if invalid
 */
export async function loadConfig(): Promise<UnifiedConfig> {
  const configPath = getConfigPath();
  if (!(await fs.pathExists(configPath))) {
    return DEFAULT_CONFIG;
  }
  try {
    const json = await fs.readJson(configPath);
    const parsed = configSchema.parse(json);
    return parsed;
  } catch (err) {
    console.error('Invalid ai-guards.json – using defaults', err);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save the unified configuration
 * - Writes atomically to ai-guards.json
 */
export async function saveConfig(config: UnifiedConfig): Promise<void> {
  const cfg: UnifiedConfig = { ...config, version: 1 };
  const tmp = getConfigPath() + '.tmp';
  await fs.writeJson(tmp, cfg, { spaces: 2 });
  await fs.move(tmp, getConfigPath(), { overwrite: true });
}

/**
 * Ensure a config file exists with at least empty collections
 */
export async function ensureConfigExists(): Promise<void> {
  if (!(await fs.pathExists(getConfigPath()))) {
    await saveConfig(DEFAULT_CONFIG);
  }
}

// ----------------------------
// Rule Registry Operations
// ----------------------------

/**
 * Update a single rule in the config
 */
export async function updateRule(rule: RuleMeta): Promise<void> {
  const cfg = await loadConfig();
  const idx = cfg.rules.findIndex(r => r.id === rule.id);
  if (idx >= 0) cfg.rules[idx] = rule; else cfg.rules.push(rule);
  await saveConfig(cfg);
}

/**
 * Set the entire rules collection
 */
export async function setRules(rules: RuleMeta[]): Promise<void> {
  const cfg = await loadConfig();
  cfg.rules = rules;
  await saveConfig(cfg);
}

// ----------------------------
// Template Operations
// ----------------------------

/**
 * Update or add a template in the config
 */
export async function updateTemplate(template: Template): Promise<void> {
  const cfg = await loadConfig();
  cfg.templates[template.id] = template;
  await saveConfig(cfg);
}

/**
 * Remove a template from the config
 */
export async function removeTemplate(tid: string): Promise<void> {
  const cfg = await loadConfig();
  if (cfg.templates[tid]) {
    delete cfg.templates[tid];
    await saveConfig(cfg);
  }
} 