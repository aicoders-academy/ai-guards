import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import { z } from 'zod';

// ----------------------------
// Types & Validation Schema
// ----------------------------

export type RuleType = 'always' | 'auto-attached' | 'agent-requested' | 'manual';

export interface RuleMeta {
  id: string;               // filename without extension
  path: string;             // absolute or project‑relative path
  ruleType: RuleType;       // derived from front‑matter or heuristics
  description?: string;     // from front‑matter
  globs?: string[];         // patterns for auto‑attached
  fileExtensions?: string[];// quick lookup keys
  alwaysApply?: boolean;    // from front‑matter
}

export interface RuleRegistry {
  version: 1;
  rules: RuleMeta[];
}

// Zod schema for runtime validation
const ruleMetaSchema = z.object({
  id: z.string(),
  path: z.string(),
  ruleType: z.enum(['always', 'auto-attached', 'agent-requested', 'manual']),
  description: z.string().optional(),
  globs: z.array(z.string()).optional(),
  fileExtensions: z.array(z.string()).optional(),
  alwaysApply: z.boolean().optional()
});

const registrySchema = z.object({
  version: z.literal(1),
  rules: z.array(ruleMetaSchema)
});

// ----------------------------
// Helper paths
// ----------------------------

export function getRegistryPath(): string {
  return path.join(process.cwd(), 'ai-guards.json');
}

function getRulesDir(): string {
  return path.join(process.cwd(), '.ai-guards', 'rules');
}

// ----------------------------
// Core helpers
// ----------------------------

export async function loadRegistry(): Promise<RuleRegistry> {
  const registryPath = getRegistryPath();
  if (!(await fs.pathExists(registryPath))) {
    // Return default empty registry
    return { version: 1, rules: [] } as RuleRegistry;
  }

  try {
    const json = await fs.readJson(registryPath);
    const parsed = registrySchema.parse(json); // throws if invalid
    return parsed;
  } catch (error) {
    console.error('Failed to load ai-guards.json – using empty registry', error);
    return { version: 1, rules: [] } as RuleRegistry;
  }
}

export async function saveRegistry(registry: RuleRegistry): Promise<void> {
  const registryPath = getRegistryPath();
  // Write atomically – write to tmp then rename
  const tmpPath = registryPath + '.tmp';
  await fs.writeJson(tmpPath, registry, { spaces: 2 });
  await fs.move(tmpPath, registryPath, { overwrite: true });
}

// ----------------------------
// Rule metadata extraction
// ----------------------------

interface ParsedFrontMatter {
  description?: string;
  globs?: string[];
  alwaysApply?: boolean;
}

function parseFrontMatter(content: string): ParsedFrontMatter {
  const FRONT_MATTER_REGEX = /^---\n([\s\S]*?)\n---/;
  const match = content.match(FRONT_MATTER_REGEX);
  if (!match) return {};

  const yamlBlock = match[1];
  const lines = yamlBlock.split(/\r?\n/);
  const res: ParsedFrontMatter = {};
  lines.forEach(line => {
    const [key, ...rest] = line.split(':');
    if (!key) return;
    const valueRaw = rest.join(':').trim();
    const keyTrim = key.trim();
    switch (keyTrim) {
      case 'description':
        res.description = valueRaw;
        break;
      case 'globs':
        // Could be array or single; naive parse
        if (valueRaw) {
          res.globs = valueRaw.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          res.globs = [];
        }
        break;
      case 'alwaysApply':
        res.alwaysApply = valueRaw.toLowerCase() === 'true';
        break;
    }
  });
  return res;
}

function deriveRuleType(meta: ParsedFrontMatter): RuleType {
  if (meta.alwaysApply) return 'always';
  if (meta.globs && meta.globs.length) return 'auto-attached';
  return 'manual';
}

/** Extract rule metadata from a file path */
export async function extractRuleMeta(ruleFilePath: string): Promise<RuleMeta> {
  const content = await fs.readFile(ruleFilePath, 'utf8');
  const fm = parseFrontMatter(content);
  const ruleType = deriveRuleType(fm);

  // id from filename without extension
  const id = path.basename(ruleFilePath).replace(path.extname(ruleFilePath), '');

  // Guess file extensions from globs (e.g., **/*.ts => .ts)
  const exts = (fm.globs || []).reduce<string[]>((acc, g) => {
    const extMatch = g.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      acc.push('.' + extMatch[1]);
    }
    return acc;
  }, []);

  const meta: RuleMeta = {
    id,
    path: path.relative(process.cwd(), ruleFilePath),
    ruleType,
    description: fm.description,
    globs: fm.globs,
    fileExtensions: exts.length ? exts : undefined,
    alwaysApply: fm.alwaysApply
  };
  return meta;
}

/**
 * Add or update a single rule entry in the registry.
 */
export async function addRule(ruleFilePath: string): Promise<void> {
  const registry = await loadRegistry();
  const meta = await extractRuleMeta(ruleFilePath);

  const existingIndex = registry.rules.findIndex(r => r.id === meta.id);
  if (existingIndex >= 0) {
    registry.rules[existingIndex] = meta; // Overwrite existing (idempotent)
  } else {
    registry.rules.push(meta);
  }
  await saveRegistry(registry);
}

/**
 * Rebuild registry by scanning all rule files under .ai-guards/rules
 */
export async function syncRegistry(): Promise<void> {
  const ruleFiles = glob.sync('**/*.{md,markdown}', { cwd: getRulesDir(), absolute: true });
  const registry: RuleRegistry = { version: 1, rules: [] };
  for (const file of ruleFiles) {
    try {
      const meta = await extractRuleMeta(file);
      registry.rules.push(meta);
    } catch (error) {
      console.error(`Failed to parse rule ${file}:`, error);
    }
  }
  await saveRegistry(registry);
}

// Convenience helper to ensure registry exists (called from init)
export async function ensureRegistryExists(): Promise<void> {
  const registryPath = getRegistryPath();
  if (await fs.pathExists(registryPath)) return;
  await saveRegistry({ version: 1, rules: [] });
} 