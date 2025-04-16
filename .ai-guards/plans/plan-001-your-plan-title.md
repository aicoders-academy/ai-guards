---
id: plan-001
title: Add Prompt Templates to AI-Guards CLI
createdAt: 2025-04-16
author: ai-guards
status: draft
---

## 🧩 Scope

Add support for prompt templates in the AI-Guards CLI tool. This will allow users to initialize their projects with predefined prompt templates and customize them according to their needs.

## ✅ Functional Requirements

- Add a new `--templates` flag to the `init` command
- Allow users to select and install only specific prompt templates (e.g., via CLI selection or flags), similar to shadcn/ui's component selection approach
- Create a templates directory structure in `.ai-guards/templates`
- Include default prompt templates for common AI assistance scenarios:
  - Code review prompts
  - Code generation prompts
  - Documentation generation prompts
  - Testing prompts
- Allow users to skip template initialization with `--no-templates` flag
- Provide template customization instructions in README
- Implement a `templates.json` configuration file to track installed templates and their settings
- Add a dedicated command to add specific templates after initialization: `ai-guards add <template-name>`
- Create a registry of available templates that can be browsed and added

## ⚙️ Non-Functional Requirements

- Security: Templates should be stored locally, no external dependencies
- Maintainability: Templates should follow a consistent format for easy updates

## 📚 Guidelines & Packages

- Follow project guidelines:
  - Use TypeScript for implementation
  - Maintain consistent error handling
  - Add unit tests for new functionality
- Packages to use:
  - commander (MIT) - for CLI argument handling
  - fs-extra (MIT) - for file operations
  - inquirer (MIT) - for interactive prompts
  - chalk (MIT) - for colored output

## 🔐 Threat Model (Stub)

- Template injection: Ensure template content is properly sanitized
- File system permissions: Verify write access before template creation
- Path traversal: Validate template paths to prevent directory traversal

## 🔢 Execution Plan

1. Update command structure to support template flags and add the new `add` command
2. Create template directory structure and default templates
3. Implement `templates.json` configuration file structure
4. Create a template registry system to track available templates
5. Implement template initialization logic with selection options
6. Add selective template installation via `add` command
7. Add user prompts for template customization
8. Update documentation with template usage instructions
9. Add unit tests for template functionality
10. Perform security review of template handling
