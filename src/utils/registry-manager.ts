import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import {
  updateRule,
  setRules,
  ensureConfigExists,
  RuleMeta
} from './config-manager';

// ----------------------------
// Types & Validation Schema
// ----------------------------

// Export RuleType for use by other modules
export type RuleType = 'always' | 'auto-attached' | 'agent-requested' | 'manual';

// ----------------------------
// Helper paths
// ----------------------------

function getRulesDir(): string {
  return path.join(process.cwd(), '.ai-guards', 'rules');
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
 * Uses config-manager for storage.
 */
export async function addRule(ruleFilePath: string): Promise<void> {
  const meta = await extractRuleMeta(ruleFilePath);
  await updateRule(meta);
}

/**
 * Rebuild registry by scanning all rule files under .ai-guards/rules
 * Uses config-manager for storage.
 */
export async function syncRegistry(): Promise<void> {
  const ruleFiles = glob.sync('**/*.{md,markdown}', { cwd: getRulesDir(), absolute: true });
  const rules: RuleMeta[] = [];
  
  for (const file of ruleFiles) {
    try {
      const meta = await extractRuleMeta(file);
      rules.push(meta);
    } catch (error) {
      console.error(`Failed to parse rule ${file}:`, error);
    }
  }
  
  await setRules(rules);
}

// Convenience helper to ensure registry exists (called from init)
// Uses config-manager's ensureConfigExists function
export async function ensureRegistryExists(): Promise<void> {
  await ensureConfigExists();
} 