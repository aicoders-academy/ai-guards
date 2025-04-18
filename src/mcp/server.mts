import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "child_process";
import { promisify } from "util";

import { z } from "zod";

const execAsync = promisify(exec);

const server = new McpServer({
  name: "Echo",
  version: "1.0.0"
});

server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [{
      uri: uri.href,
      text: `Resource echo: ${message}`
    }]
  })
);
server.tool(
  "plan",
  { message: z.string() },
  async ({ message }: { message: string }) => {
    try {
      const { stdout, stderr } = await execAsync(`npx ai-guards plan`);
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

server.tool(
  "review", 
  { message: z.string() },
  async ({ message }: { message: string }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.tool(
  "validate",
  { message: z.string() },
  async ({ message }: { message: string }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.tool(
  "execute",
  { message: z.string() },
  async ({ message }: { message: string }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.tool(
  "commit",
  { message: z.string() },
  async ({ message }: { message: string }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.prompt(
  "echo",
  { message: z.string() },
  ({ message }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please process this message: ${message}`
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