![make vibe coding great again](https://github.com/user-attachments/assets/290b80c9-addf-48ec-8e53-7690f0edb02b)

# AI Guards for vibe coding

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
