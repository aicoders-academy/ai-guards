import * as fs from 'fs-extra';
import * as path from 'path';
import { extractRuleMeta } from '../utils/registry-manager';

describe('parseFrontMatter compatibility', () => {
  const tmpDir = path.join(process.cwd(), 'tmp-test');
  const rulePath = path.join(tmpDir, 'rule.md');

  beforeAll(async () => {
    await fs.ensureDir(tmpDir);
    const content = [
      '---\r',
      'description: Windows line endings',
      'globs: **/*.ts',
      'alwaysApply: true',
      '---',
      '',
      'Rule body'
    ].join('\r\n');
    await fs.writeFile(rulePath, content);
  });

  afterAll(async () => {
    await fs.remove(tmpDir);
  });

  it('handles CRLF front matter', async () => {
    const meta = await extractRuleMeta(rulePath);
    expect(meta.description).toBe('Windows line endings');
    expect(meta.globs).toEqual(['**/*.ts']);
    expect(meta.alwaysApply).toBe(true);
  });
});
