# Integrating AI-Guards MCP in Your Tools

The AI-Guards Model Context Protocol (MCP) server allows you to integrate AI-Guards capabilities directly into compatible AI assistants like Cursor, Claude Desktop, Windsurf, and other MCP-enabled tools. This integration enables AI assistants to access and use AI-Guards features for planning, reviewing, and managing AI-assisted coding workflows.

## What is Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is an open standard that connects AI assistants to external tools and data sources. It allows language models to interact with specialized services like AI-Guards without requiring complex integrations or manual copy-pasting.

## Integrating with AI-Guards MCP

### Requirements

- Node.js >= 20
- An MCP-compatible client application (Cursor, Claude Desktop, Windsurf, etc.)
- AI-Guards installed (`npm install -g ai-guards`) or available via npx

### Setup in Cursor

Add AI-Guards MCP to your Cursor settings by going to:
`Settings → Cursor Settings → MCP → Add new global MCP server`

Or manually add this to your Cursor MCP configuration file (`~/.cursor/mcp.json`):

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

### Setup in Windsurf

Add this to your Windsurf MCP configuration file:

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

### Setup in Claude Desktop

Add this to your Claude Desktop's MCP configuration:

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

## Using AI-Guards MCP in Your Prompts

Once integrated, you can access AI-Guards features directly in your AI assistant simply by mentioning AI-Guards in your prompts. For example:

- "Plan this feature implementation using AI-Guards"
- "Review this PR with AI-Guards"
- "Help me implement this feature following AI-Guards standards"

The assistant will automatically connect to AI-Guards and apply the appropriate standards and workflows.

## Available MCP Features

AI-Guards MCP provides the following capabilities to AI assistants:

1. **Plan Generation**: Create structured development plans for features or tasks
   - `plan`: Generate a new AI plan template with customizable title and author

2. **Project Initialization**: Set up AI-Guards in new or existing projects
   - `init`: Initialize AI-Guards with options for template selection

3. **Template Management**: Add and manage prompt templates
   - `add-template`: Add specific templates or list available ones

4. **Rules Management**: View and manage coding rules
   - `list-rules`: List all installed rules with optional JSON output

5. **Automatic Project Detection**: The MCP server automatically finds your project root by looking for `.ai-guards` directory or `ai-guards.json` file

## Benefits of MCP Integration

- **No Context Switching**: Interact with AI-Guards directly from your AI assistant
- **Standardized Workflows**: Ensure consistent AI-assisted development practices
- **Better Code Quality**: Apply AI-Guards standards without manual intervention
- **Team Alignment**: Maintain team coding standards across different AI coding sessions

## Advanced Integration

For custom integrations or extending the AI-Guards MCP functionality, you can:

1. Create custom MCP servers that include AI-Guards capabilities
2. Build tools that consume the AI-Guards MCP outputs
3. Integrate AI-Guards MCP into your CI/CD pipelines

## Troubleshooting

If you encounter issues with the AI-Guards MCP integration:

1. **Project Not Found Error**: 
   - Make sure you're working in a directory that contains `.ai-guards` folder or `ai-guards.json` file
   - The MCP server will search up to 10 parent directories to find the project root
   - Initialize AI-Guards in your project first using `npx ai-guards init`

2. **Command Execution Errors**:
   - Ensure you have the latest version of AI-Guards installed
   - Check that Node.js >= 20 is installed
   - Verify npm/npx is available in your PATH

3. **MCP Connection Issues**:
   - Check that your MCP configuration is correctly set up
   - Restart your AI assistant application
   - Look for error messages in the AI assistant's console/logs

4. **General Tips**:
   - The MCP server will log the working directory when executing commands
   - All commands are executed in the project root directory automatically
   - Ensure the project has been initialized with AI-Guards before using other commands

For further assistance, submit an issue on our [GitHub repository](https://github.com/aicoders-academy/ai-guards). 