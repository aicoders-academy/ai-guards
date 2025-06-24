#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { join, dirname } from "path";

import { z } from "zod";

const execAsync = promisify(exec);

// Function to find the project root by looking for .ai-guards directory
function findProjectRoot(startPath: string = process.cwd()): string | null {
  let currentPath = startPath;
  
  // Check up to 10 parent directories
  for (let i = 0; i < 10; i++) {
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
  
  // If not found, check if ai-guards.json exists (for uninitialized projects)
  currentPath = startPath;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(currentPath, 'ai-guards.json'))) {
      return currentPath;
    }
    
    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      break;
    }
    currentPath = parentPath;
  }
  
  return null;
}

const server = new McpServer({
  name: "AI Guards",
  version: "0.0.8"
});

server.resource(
  "plan",
  new ResourceTemplate("plan://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [{
      uri: uri.href,
      text: `Resource plan: ${message}`
    }]
  })
);
server.tool(
  "plan",
  { message: z.string() },
  async ({ message }: { message: string }) => {
    try {
      const projectRoot = findProjectRoot();
      
      if (!projectRoot) {
        return {
          content: [{ 
            type: "text", 
            text: "Error: Could not find AI Guards project. Make sure you're in a project with .ai-guards directory or ai-guards.json file." 
          }]
        };
      }
      
      console.log(`Generating plan for message: ${message} in directory: ${projectRoot}`);
      
      // Execute the command in the project root directory
      const { stdout, stderr } = await execAsync(`npx ai-guards plan`, {
        cwd: projectRoot
      });
      
      if (stderr) {
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

// Initialize AI Guards in a project
server.tool(
  "init",
  { 
    templates: z.boolean().optional(),
    selectTemplates: z.boolean().optional() 
  },
  async ({ templates, selectTemplates }) => {
    try {
      const projectRoot = findProjectRoot() || process.cwd();
      
      let command = "npx ai-guards init";
      if (templates === false) {
        command += " --no-templates";
      } else if (selectTemplates) {
        command += " --select-templates";
      } else if (templates === true) {
        command += " --templates";
      }
      
      console.log(`Initializing AI Guards in directory: ${projectRoot}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectRoot
      });
      
      if (stderr) {
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

// Add a template to the project
server.tool(
  "add-template",
  { 
    templateId: z.string().optional(),
    list: z.boolean().optional() 
  },
  async ({ templateId, list }) => {
    try {
      const projectRoot = findProjectRoot();
      
      if (!projectRoot) {
        return {
          content: [{ 
            type: "text", 
            text: "Error: Could not find AI Guards project. Make sure you're in a project with .ai-guards directory or ai-guards.json file." 
          }]
        };
      }
      
      let command = "npx ai-guards add";
      if (list) {
        command += " --list";
      } else if (templateId) {
        command += ` ${templateId}`;
      }
      
      console.log(`Running command: ${command} in directory: ${projectRoot}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectRoot
      });
      
      if (stderr) {
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

// List rules
server.tool(
  "list-rules",
  { json: z.boolean().optional() },
  async ({ json }) => {
    try {
      const projectRoot = findProjectRoot();
      
      if (!projectRoot) {
        return {
          content: [{ 
            type: "text", 
            text: "Error: Could not find AI Guards project. Make sure you're in a project with .ai-guards directory or ai-guards.json file." 
          }]
        };
      }
      
      let command = "npx ai-guards rules list";
      if (json) {
        command += " --json";
      }
      
      console.log(`Listing rules in directory: ${projectRoot}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectRoot
      });
      
      if (stderr) {
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

server.prompt(
  "plan-feature",
  { message: z.string() },
  ({ message }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please generate a feature development plan for the following message: ${message}`
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