 <img src="https://github.com/user-attachments/assets/3a9b389d-ac0c-456e-afd5-6a5a31652075" alt="Alt Text" width="300" >

# AI Guards - The framework for AI Driven Development

Standardize how teams **plan, review, execute, and verify** AI‑assisted code—without locking them into a single IDE or toolchain.

## Installation

### Global Installation
```bash
npm install -g ai-guards
```

### Quick Start
Initialize a new project with AI Guards in less than 30 seconds:
```bash
npx ai-guards init
```

## Usage

### Commands

| Command         | Description                           | Usage                            |
|-----------------|---------------------------------------|----------------------------------|
| `init`          | Initialize AI Guards in a project     | `ai-guards init [--templates] [--no-templates] [--select-templates]` |
| `plan`          | Generate a new plan template          | `ai-guards plan [-t title] [-a author]` |
| `add`           | Add a prompt template to your project | `ai-guards add [template-id]` or `ai-guards add --list` |

## Directory Layout
```text
.ai-guards/
├── rules/              # Current version
│   ├── guidelines/     # Org‑wide coding style and guidelines
│   ├── security/       # Security rules
│   └── general/        # General rules
|── templates/          # Reusable prompt & rule snippets (.test.md, .component.md, etc)
└── plans/              # Prompt → result → human rating
```

## Rule Types

| Rule Type         | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------------------------|
| **Always**        | Always included in the model context.                                                        |
| **Auto Attached** | Included when files matching a glob pattern are referenced.                                  |
| **Agent Requested** | Rule is available to the AI, which decides whether to include it. Must provide a description. |
| **Manual**        | Only included when explicitly mentioned using `@ruleName`.                                   |

For more details about the AI Guards workflow and concepts, refer to the [detailed documentation](https://github.com/your-repo/ai-guards).

## License
MIT

---

## Command Reference

### Initialize Project

```bash
# Initialize AI Guards in your project
ai-guards init

# Skip template initialization
ai-guards init --no-templates

# Select specific templates
ai-guards init --select-templates
```

### Manage Plans

```bash
# Create a new plan
ai-guards plan

# Create a plan with custom title
ai-guards plan -t "My custom plan"
```

### Manage Templates

```bash
# List available templates
ai-guards add --list

# Add a specific template
ai-guards add <template-id>
```

### Manage Rules

```bash
# Add a rule file to your project (.md file with front-matter)
ai-guards rules add <rule-file> --category guidelines

# List all installed rules
ai-guards rules list

# Format as JSON
ai-guards rules list --json

# Rebuild registry from rules folder
ai-guards rules sync
```

---

## Rule Registry

AI Guards maintains a registry of all installed rules and templates in a unified configuration file called `ai-guards.json` at the project root. This file is automatically created during initialization and updated when rules or templates are added, modified, or removed.

### Configuration Schema  


The schema uses a unified configuration format that combines rules, templates and other settings into a single file:

```jsonc
{
  "version": 1,
  "rules": [
    {
      "id": "service-naming",           // filename without extension
      "path": ".ai-guards/rules/guidelines/service-naming.md",
      "ruleType": "auto-attached",      // always | auto-attached | agent-requested | manual
      "description": "RPC Service boilerplate", 
      "globs": ["**/*.ts"],             // patterns for auto-attached rules
      "fileExtensions": [".ts"],        // quick lookup key derived from globs
      "alwaysApply": false              // true for 'always' rule type
    }
  ],
  "templates": {
    "code-review": {
      "id": "code-review",
      "name": "Code Review",
      "description": "A comprehensive code review prompt",
      "category": "review",
      "path": ".ai-guards/templates/code-review.md",
      "installedAt": "2025-04-28T12:00:00Z",
      "customized": false
    }
  },
  "config": {
    "defaultCategory": "guidelines",
    "customTemplatesPath": null
  }
}
```



### Rule Types

| Rule Type         | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------------------------|
| **always**        | Always included in the model context.                                                        |
| **auto-attached** | Included when files matching a glob pattern are referenced.                                  |
| **agent-requested** | Rule is available to the AI, which decides whether to include it. Must provide a description. |
| **manual**        | Only included when explicitly mentioned using `@ruleName`.                                   |

### Front Matter

Rule files use front matter to define metadata:

```md
---
description: RPC Service boilerplate
globs: **/*.ts, **/*.js
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
```

- **description**: Description of the rule's purpose
- **globs**: Comma-separated list of glob patterns for automatic attachment
- **alwaysApply**: Set to `true` for rules that should always be included

---

#### 1. Purpose  
Standardize how teams **plan, review, execute, and verify** AI‑assisted code—without locking them into a single IDE or toolchain.

---

#### 2. Five‑Stage Workflow  

1. **Plan** – reasoning LLM  
   - Scope, functional / non‑functional reqs  
   - Dev guidelines + approved packages (license & security pre‑check)  
   - Threat‑model stub  
   - Numbered execution plan  

2. **Review** – developer ± reasoning LLM  
   - Close gaps, edge cases, compliance issues  
   - Sign‑off

3. **Delegate** – coding LLM  
   - Implement tasks sequentially  
   - One Git branch per task

4. **Commit** – automatic  
   - Checkpoint after each step, ties commit → plan ID  

5. **Validate** – CI pipeline  
   - Run unit + security tests, license scan  
   - Failures stop merge; low‑confidence LLM output escalates to senior dev

---

#### 3. Directory Layout  
```text
.ai-guards/
├── rules/              # Current version
│   ├── guidelines/     # Org‑wide coding style and guidelines
│   ├── security/       # Security rules
│   └── general/        # General rules
|── templates/          # Reusable prompt & rule snippets (.test.md, .component.md, etc)
└── plans/              # Prompt → result → human rating
```

---

#### 4. Rule Types

| Rule Type         | Description                                                                                   |
|-------------------|----------------------------------------------------------------------------------------------|
| **Always**        | Always included in the model context.                                                        |
| **Auto Attached** | Included when files matching a glob pattern are referenced.                                  |
| **Agent Requested** | Rule is available to the AI, which decides whether to include it. Must provide a description. |
| **Manual**        | Only included when explicitly mentioned using `@ruleName`.                                   |


Rule example

```md
---

description: RPC Service boilerplate
globs: 
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
```

---


#### 5. Templates

AI Guards provides a collection of prompt templates for common AI assistance scenarios. You can initialize your project with all templates, select specific ones during initialization, or add them later.

### Managing Templates

```bash
# Initialize with all templates
ai-guards init --templates

# Initialize with selected templates
ai-guards init --select-templates

# Skip template initialization
ai-guards init --no-templates

# List available templates
ai-guards add --list

# Add a specific template
ai-guards add code-review

# Interactive template selection
ai-guards add
```

### Available Template Categories

- **Code Review** - Templates for reviewing and analyzing code
- **Code Generation** - Templates for generating new code
- **Documentation** - Templates for generating documentation
- **Testing** - Templates for generating test cases and testing strategies

### Template Structure

Each template follows a consistent format with metadata and prompt content:

```md
---
id: template-id
name: Template Name
description: Template description
category: template-category
---

# Template Content

Your template content goes here...
```

You can customize templates after installation by editing the files in the `.ai-guards/templates/` directory.

---


#### 6. Plans

AI Guards generates plan templates that you can edit to define your project specifications.

### Creating a Plan

```bash
# Generate a plan template with default title and author
ai-guards plan

# Generate a plan with a custom title
ai-guards plan -t "Add user authentication"

# Generate a plan with custom title and author
ai-guards plan -t "Add user authentication" -a "Your Name"
```

This will create a `.md` file in the `.ai-guards/plans/` directory that you can edit with your text editor.

### Plan Structure

Plan example:

```md
---
id: plan-001
title: Add user authentication to API
createdAt: 2025-04-15
author: ai-guards
status: draft
---

## 🧩 Scope

Implement login, logout, and session validation endpoints using JWT.

## ✅ Functional Requirements

- POST /login: authenticate user, return JWT  
- POST /logout: invalidate client-side token  
- Middleware: validate token on protected routes  
- User validation from existing PostgreSQL DB

## ⚙️ Non-Functional Requirements

- API response time < 200ms  
- Log all auth attempts with timestamps and IP

## 📚 Guidelines & Packages

- Follow `@api-guidelines`  
- Use `jsonwebtoken` (MIT license)  
- No external auth providers

## 🔐 Threat Model (Stub)

- Credential stuffing  
- Token replay  
- Session fixation

## 🔢 Execution Plan

1. Create `auth/` module scaffold  
2. Implement POST /login with JWT issuance  
3. Implement POST /logout (client token discard)  
4. Add token validation middleware  
5. Write unit tests for all logic  
```


---

#### 7. CLI Wrapper (`ai-guards`)  

| Command            | Action |
|--------------------|--------|
| `plan`
```

## MCP Integration

AI-Guards can be integrated with MCP-compatible tools like Cursor, Claude Desktop, and Windsurf using the Model Context Protocol (MCP).

### Setup in MCP-compatible Tools

Add AI-Guards MCP to your Cursor settings by going to:
`Settings → Cursor Settings → MCP → Add new global MCP server`

Or manually add this to your MCP configuration file:

```json
{
  "mcpServers": {
    "ai-guards": {
      "command": "npx",
      "args": ["-y", "ai-guards-mcp"]
    }
  }
}
```

### Using AI-Guards MCP

Once integrated, you can access AI-Guards features directly in your AI assistant by mentioning AI-Guards in your prompts:

- "Plan this feature implementation using AI-Guards"
- "Review this PR with AI-Guards"
- "Help me implement this feature following AI-Guards standards"

For more details, see [MCP Integration Guide](docs/MCP-INTEGRATION.md).

## Testing

AI Guards includes a comprehensive test suite using Jest. The tests cover utility functions, commands, and the main CLI functionality.

### Running Tests

To run the test suite:

```bash
npm test
```

To run tests with coverage reporting:

```bash
npm run test:coverage
```

Current code coverage:
- Statements: ~98%
- Branches: ~72%
- Functions: ~85%
- Lines: ~98%

### Test Structure

- `src/__tests__/` - Contains all test files
  - `utils/` - Tests for utility functions
  - `commands/` - Tests for CLI commands
  - `index.test.ts` - Tests for the main CLI entry point

### Writing Tests

When adding new features, please include tests. The project uses ts-jest for TypeScript support. Mock dependencies appropriately to ensure isolated testing.

Example:

```typescript
// Mock dependencies
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  writeFile: jest.fn()
}));

// Import mocked modules after mocking
const fs = require('fs-extra');

describe('myFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something expected', () => {
    // Test implementation
    expect(result).toBe(expectedValue);
  });
});
```
