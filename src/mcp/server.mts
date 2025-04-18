import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "child_process";
import { promisify } from "util";

import { z } from "zod";

const execAsync = promisify(exec);

const server = new McpServer({
  name: "AI Guards",
  version: "0.0.2"
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
      console.log(`Generating plan for message: ${message}`);
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