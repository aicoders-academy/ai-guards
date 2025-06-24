# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Guards is a framework for AI-driven development that standardizes how teams plan, review, execute, and verify AI-assisted code. It provides a CLI tool and MCP (Model Context Protocol) server for integrating with AI assistants.

## Key Commands

### Development
```bash
npm run build          # Build TypeScript and copy templates to dist/
npm run dev           # Run in development mode (ts-node)
npm run mcp           # Run the MCP server
npm start             # Run the built CLI
```

### Testing
```bash
npm test              # Run Jest test suite
npm run test:coverage # Run tests with coverage report
```

### CLI Commands
```bash
ai-guards init [--templates] [--no-templates] [--select-templates]  # Initialize project
ai-guards plan [-t title] [-a author]                              # Generate plan template
ai-guards add [template-id] [--list]                               # Add prompt templates
ai-guards rules add <rule-file> --category <category>              # Add rules
ai-guards rules list [--json]                                      # List installed rules
ai-guards rules sync                                               # Rebuild registry
```

## Architecture

### Core Structure
- **CLI Entry Point**: `src/index.ts` - Commander-based CLI with commands for init, plan, add, and rules
- **Commands**: `src/commands/` - Implementation of each CLI command
- **Utils**: `src/utils/` - Core utilities for config, registry, and template management
- **MCP Server**: `src/mcp/server.mts` - Model Context Protocol server for AI assistant integration
- **Templates**: `src/templates/` - Built-in prompt templates (code-review, documentation, testing, etc.)

### Key Components

1. **Config Manager** (`src/utils/config-manager.ts`)
   - Manages unified `ai-guards.json` configuration
   - Handles rules and templates registry
   - Schema validation with Zod

2. **Registry Manager** (`src/utils/registry-manager.ts`)
   - Manages rules with types: always, auto-attached, agent-requested, manual
   - Handles rule discovery and categorization
   - Front-matter parsing for rule metadata

3. **Template Manager** (`src/utils/template-manager.ts`)
   - Manages prompt templates
   - Handles template installation and customization
   - Template registry operations

### Data Flow
1. User runs CLI command → Commander parses → Command handler executes
2. Commands interact with config/registry/template managers
3. All state stored in `ai-guards.json` at project root
4. MCP server reads from the same configuration

### Project Structure Created by AI Guards
```
.ai-guards/
├── rules/              # Coding standards and guidelines
│   ├── guidelines/     # Org-wide style rules
│   ├── security/       # Security rules
│   └── general/        # General rules
├── templates/          # Reusable prompt templates
└── plans/              # Development plans and specifications
```

## Testing Approach

- Jest with ts-jest for TypeScript support
- Mock all file system operations
- Test files in `src/__tests__/` mirroring source structure
- Coverage targets: ~98% statements, ~85% functions
- Setup file at `src/__tests__/setup.js` configures test environment

## Important Patterns

1. **Rule Types**:
   - `always`: Always included in model context
   - `auto-attached`: Included when matching files are referenced (glob patterns)
   - `agent-requested`: AI decides whether to include (requires description)
   - `manual`: Only included when explicitly mentioned with @ruleName

2. **Front Matter**: Rules use YAML front matter for metadata:
   ```markdown
   ---
   description: Rule description
   globs: **/*.ts, **/*.js
   alwaysApply: false
   ---
   ```

3. **Unified Config**: Single `ai-guards.json` contains rules, templates, and settings

## Building and Publishing

1. `npm run build` compiles TypeScript and copies templates to dist/
2. The package includes two binaries:
   - `ai-guards`: Main CLI tool
   - `ai-guards-mcp`: MCP server for AI assistant integration
3. Files included in npm package: dist/, bin/