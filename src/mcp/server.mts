#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { join, dirname } from "path";

import { z } from "zod";

const execAsync = promisify(exec);

// Function to find the project root by looking for plans directory
function findProjectRoot(startPath: string = process.cwd()): string | null {
  let currentPath = startPath;
  
  // Check up to 10 parent directories
  for (let i = 0; i < 10; i++) {
    // Check for new format (.plans)
    if (existsSync(join(currentPath, '.plans'))) {
      return currentPath;
    }
    
    // Check for legacy format (.ai-guards)
    if (existsSync(join(currentPath, '.ai-guards'))) {
      return currentPath;
    }
    
    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      // Reached the root of the filesystem
      break;
    }
    currentPath = parentPath;
  }
  
  return null;
}

const server = new McpServer({
  name: "AI Guards - Feature Planning",
  version: "0.1.0",
  description: "AI-powered feature planning tool"
});
// Tool: Create a new feature plan
server.tool(
  "create-plan",
  { 
    title: z.string().describe("Title for the feature plan"),
    author: z.string().optional().describe("Author name (optional, uses git user by default)")
  },
  async ({ title, author }) => {
    try {
      const projectRoot = findProjectRoot();
      
      if (!projectRoot) {
        return {
          content: [{ 
            type: "text", 
            text: "Error: Could not find AI Guards project. Run 'ai-guards init' first." 
          }]
        };
      }
      
      let command = `npx ai-guards plan --title "${title}"`;
      if (author) {
        command += ` --author "${author}"`;
      }
      
      console.log(`Creating plan in directory: ${projectRoot}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectRoot
      });
      
      if (stderr && !stderr.includes('ExperimentalWarning')) {
        return {
          content: [{ type: "text", text: `Error: ${stderr}` }]
        };
      }
      
      return {
        content: [{ type: "text", text: stdout }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error executing command: ${errorMessage}` }]
      };
    }
  }
);

// Tool: Initialize AI Guards project
server.tool(
  "init",
  { 
    folder: z.string().optional().describe("Folder name for plans (default: .plans)")
  },
  async ({ folder }) => {
    try {
      const currentDir = process.cwd();
      
      let command = "npx ai-guards init";
      if (folder) {
        command += ` --folder "${folder}"`;
      }
      
      console.log(`Initializing AI Guards in directory: ${currentDir}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: currentDir
      });
      
      if (stderr && !stderr.includes('ExperimentalWarning')) {
        return {
          content: [{ type: "text", text: `Error: ${stderr}` }]
        };
      }
      
      return {
        content: [{ type: "text", text: stdout }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error executing command: ${errorMessage}` }]
      };
    }
  }
);

// Prompt: Guide for creating a feature plan
server.prompt(
  "plan-feature",
  { feature: z.string().describe("Feature description") },
  ({ feature }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `I need to plan the following feature: ${feature}

Please help me create a comprehensive development plan that includes:
1. Scope definition
2. Functional requirements
3. Non-functional requirements (performance, security, etc.)
4. Technical approach and architecture
5. Implementation steps
6. Testing strategy
7. Potential risks and mitigations`
      }
    }]
  })
);

 
const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})().catch(error => {
  console.error("Failed to connect:", error);
  process.exit(1);
});