# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Guards is a simplified feature planning tool with MCP (Model Context Protocol) integration. It helps developers create structured, comprehensive plans for feature development that can be used by AI assistants.

## Key Commands

### Development
```bash
npm run build          # Build TypeScript
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
ai-guards init [-f folder]                 # Initialize project with optional custom folder
ai-guards plan [-t title] [-a author]      # Generate feature plan template
```

## Architecture

### Core Structure
- **CLI Entry Point**: `src/index.ts` - Commander-based CLI with init and plan commands
- **Commands**: `src/commands/` - Implementation of init and plan commands
- **Utils**: `src/utils/` - Core utilities for git user detection and ID generation
- **MCP Server**: `src/mcp/server.mts` - Model Context Protocol server for AI assistant integration

### Key Components

1. **Plan Command** (`src/commands/plan.ts`)
   - Generates structured feature plan templates
   - Uses git user info for author field
   - Creates unique plan IDs
   - Automatically detects and uses the correct plans directory

2. **Init Command** (`src/commands/init.ts`)
   - Creates plans directory structure (default: `.plans`)
   - Supports custom folder names with `--folder` option
   - Creates `.ai-guards-config` file for custom folder names

3. **MCP Server** (`src/mcp/server.mts`)
   - Provides `init` and `create-plan` tools
   - Includes `plan-feature` prompt template
   - Automatically finds project root (supports all directory formats)

4. **Plans Utils** (`src/utils/plansUtils.ts`)
   - Finds plans directory across different formats
   - Supports `.plans`, custom folders (via config), and legacy `.ai-guards/plans`
   - Handles project initialization detection

### Data Flow
1. User runs CLI command → Commander parses → Command handler executes
2. Plans are saved as markdown files with YAML front matter
3. MCP server reads from the same directory structure
4. No complex configuration - just simple file-based storage

### Project Structure Created by AI Guards

**Default:**
```
.plans/                 # Feature development plans (markdown files)
```

**Custom folder:**
```
my-plans/               # Custom folder name
.ai-guards-config       # Stores custom folder name
```

**Legacy:**
```
.ai-guards/
└── plans/              # Feature development plans (markdown files)
```

## Testing Approach

- Jest with ts-jest for TypeScript support
- Mock all file system operations
- Test files in `src/__tests__/` mirroring source structure
- Focus on core functionality: plan generation and project initialization

## Important Patterns

1. **Plan Structure**: Generated plans include:
   - YAML front matter (id, title, createdAt, author, status)
   - Scope definition
   - Functional and non-functional requirements
   - Guidelines and packages
   - Threat model stub
   - Execution plan

2. **Simplicity**: No complex configuration files, templates, or rules
   - Single directory structure
   - File-based storage
   - Git integration for author detection

3. **MCP Integration**: Simple tools for AI assistants
   - Project initialization
   - Plan creation with parameters
   - Feature planning guidance prompts

## Building and Publishing

1. `npm run build` compiles TypeScript
2. The package includes two binaries:
   - `ai-guards`: Main CLI tool
   - `ai-guards-mcp`: MCP server for AI assistant integration
3. Files included in npm package: dist/