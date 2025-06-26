# AI Guards - Feature Planning Tool

AI-powered feature planning tool with MCP (Model Context Protocol) integration for AI assistants like Cursor, Claude Desktop, and Windsurf.

## Features

✨ **Simple & Focused**: Just plan features - no complex configuration  
🤖 **MCP Integration**: Works seamlessly with AI-powered editors  
📋 **Structured Plans**: Generate consistent, comprehensive feature plans  
🚀 **Quick Setup**: Initialize in seconds

## Installation

### Global Installation
```bash
npm install -g ai-guards
```

### Quick Start
```bash
# Initialize in your project
npx ai-guards init

# Create your first plan
npx ai-guards plan --title "Add user authentication"
```

## Usage

### Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `init` | Initialize AI Guards in a project | `ai-guards init [-f folder]` |
| `plan` | Generate a new plan template | `ai-guards plan [-t title] [-a author]` |

### Examples

```bash
# Initialize project with default .plans folder
ai-guards init

# Initialize with custom folder name
ai-guards init --folder "my-plans"

# Create a plan with custom title
ai-guards plan --title "Implement dark mode"

# Create a plan with custom title and author
ai-guards plan --title "Add search feature" --author "John Doe"
```

## MCP Integration

AI Guards can be integrated with MCP-compatible tools like Cursor, Claude Desktop, and Windsurf.

### Setup

Add to your MCP configuration:

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

### Available MCP Tools

- **`init`**: Initialize AI Guards in your project with optional custom folder name
- **`create-plan`**: Create a new feature plan with title and optional author
- **`plan-feature`**: Prompt template for comprehensive feature planning

For detailed MCP setup instructions, see [MCP Integration Guide](docs/MCP-INTEGRATION.md).

## Directory Structure

AI Guards supports multiple directory structures:

**Default (new projects):**
```text
.plans/                 # Feature development plans
```

**Custom folder:**
```text
my-plans/               # Your custom folder name
.ai-guards-config       # Stores the custom folder name
```

**Legacy (backward compatibility):**
```text
.ai-guards/
└── plans/              # Feature development plans
```

## Plan Structure

Each plan includes:

- **Scope**: Clear definition of what will be built
- **Functional Requirements**: What the feature should do
- **Non-Functional Requirements**: Performance, security, scalability
- **Guidelines & Packages**: Development standards and dependencies
- **Threat Model**: Security considerations
- **Execution Plan**: Step-by-step implementation steps

## Example Plan

```markdown
---
id: plan-001
title: Add user authentication
createdAt: 2024-01-15
author: Developer
status: draft
---

## 🧩 Scope
Implement login, logout, and session validation endpoints using JWT.

## ✅ Functional Requirements
- POST /login: authenticate user, return JWT
- POST /logout: invalidate client-side token
- Middleware: validate token on protected routes

## ⚙️ Non-Functional Requirements
- API response time < 200ms
- Log all auth attempts

## 📚 Guidelines & Packages
- Use jsonwebtoken (MIT license)
- Follow REST API conventions

## 🔐 Threat Model (Stub)
- Credential stuffing
- Token replay attacks

## 🔢 Execution Plan
1. Create auth module scaffold
2. Implement POST /login with JWT
3. Implement logout functionality
4. Add token validation middleware
5. Write comprehensive tests
```

## License

MIT

---

## Command Reference

### Initialize Project

```bash
# Initialize with default .plans folder
ai-guards init

# Initialize with custom folder name
ai-guards init --folder "my-plans"
```

Creates the specified directory structure for storing plans.

### Create Plans

```bash
# Basic plan
ai-guards plan

# With custom title
ai-guards plan -t "Feature name"

# With custom title and author
ai-guards plan -t "Feature name" -a "Author Name"
```

Plans are saved in your configured plans directory and can be edited with any text editor.