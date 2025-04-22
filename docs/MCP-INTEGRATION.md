# Integrating AI-Guards MCP in Your Tools

The AI-Guards Model Context Protocol (MCP) server allows you to integrate AI-Guards capabilities directly into compatible AI assistants like Cursor, Claude Desktop, Windsurf, and other MCP-enabled tools. This integration enables AI assistants to access and use AI-Guards features for planning, reviewing, and managing AI-assisted coding workflows.

## What is Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is an open standard that connects AI assistants to external tools and data sources. It allows language models to interact with specialized services like AI-Guards without requiring complex integrations or manual copy-pasting.

## Integrating with AI-Guards MCP

### Requirements

- Node.js >= 20
- An MCP-compatible client application (Cursor, Claude Desktop, Windsurf, etc.)
- AI-Guards installed (`npm install -g ai-guards`)

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
2. **Code Review Standards**: Apply AI-Guards code review principles to code changes
3. **Workflow Standards**: Follow standardized AI-assisted coding workflows

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

1. Ensure you have the latest version of AI-Guards installed
2. Check that your MCP configuration is correctly set up
3. Restart your AI assistant application
4. Verify that the MCP server is running by checking for the startup message

For further assistance, submit an issue on our [GitHub repository](https://github.com/aicoders-academy/ai-guards). 