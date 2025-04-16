import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

export default function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize AI Guards in the current project')
    .action(async () => {
      console.log(chalk.blue('Initializing AI Guards...'));
      
      try {
        // Create base directory structure
        const aiGuardsDir = path.join(process.cwd(), '.ai-guards');
        
        // Create directories
        const directories = [
          path.join(aiGuardsDir, 'rules', 'guidelines'),
          path.join(aiGuardsDir, 'rules', 'security'),
          path.join(aiGuardsDir, 'rules', 'general'),
          path.join(aiGuardsDir, 'templates'),
          path.join(aiGuardsDir, 'plans')
        ];
        
        for (const dir of directories) {
          await fs.ensureDir(dir);
          console.log(chalk.green(`Created directory: ${dir}`));
        }
        
        // Create sample rule files
        const sampleRule = `---
description: RPC Service boilerplate
globs: 
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
`;
        
        await fs.writeFile(
          path.join(aiGuardsDir, 'rules', 'guidelines', 'service-naming.mdc'),
          sampleRule
        );
        
        // Create sample template
        const sampleTemplate = `---
description: Reusable unit test template for components
type: auto
appliesTo: *.component.tsx
---

## 🧪 Unit Test Template

Write tests using the project's test framework (e.g., Jest, Vitest).

**Checklist:**
- Cover all public functions and edge cases  
- Use mocks for external calls  
- Ensure ≥85% test coverage  

\`\`\`ts
describe('<ComponentName>', () => {
  it('should <expected behavior>', () => {
    // test logic here
  });
});
\`\`\`
`;
        
        await fs.writeFile(
          path.join(aiGuardsDir, 'templates', 'component-test.mdc'),
          sampleTemplate
        );
        
        console.log(chalk.green('AI Guards initialized successfully!'));
        console.log(chalk.blue('Directory structure created at .ai-guards/'));
      } catch (error) {
        console.error(chalk.red('Error initializing AI Guards:'), error);
        process.exit(1);
      }
    });
} 