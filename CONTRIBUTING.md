# Contributing to AI Guards

Thank you for your interest in contributing to AI Guards! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aicoders-academy/ai-guards.git
   cd ai-guards
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Link the package locally for testing:
   ```bash
   npm link
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Run in development mode:
   ```bash
   npm run dev
   ```

## Project Structure

```
ai-guards/
├── bin/                  # Global script for quick initialization
├── src/                  # Source code
│   ├── commands/         # CLI commands
│   ├── utils/            # Utility functions
│   └── templates/        # Template files
├── dist/                 # Compiled JavaScript code
├── package.json          # Project metadata and dependencies
└── tsconfig.json         # TypeScript configuration
```

## Adding a New Command

1. Create a new file in the `src/commands/` directory
2. Implement the command using the Commander.js pattern
3. Import and register the command in `src/index.ts`

Example:

```typescript
// src/commands/your-command.ts
import { Command } from 'commander';

export default function yourCommand(program: Command): void {
  program
    .command('your-command')
    .description('Description of your command')
    .option('-o, --option <value>', 'Description of option')
    .action(async (options) => {
      // Command implementation
    });
}

// Then in src/index.ts
import yourCommand from './commands/your-command';
// ...
yourCommand(program);
```

## Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful comments
- Add proper error handling

## Testing

Before submitting changes, test your code:

```bash
npm run build
ai-guards <your-command>  # Test your command
```

## Submitting Changes

1. Create a branch for your changes
2. Make your changes and commit them
3. Push your branch and create a pull request
4. Describe your changes in the pull request

## License

By contributing to AI Guards, you agree that your contributions will be licensed under the project's license. 