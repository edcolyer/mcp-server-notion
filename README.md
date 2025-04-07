# Notion MCP Server

An MCP (Model Context Protocol) server implementation for seamless integration between Claude AI and Notion workspaces, enabling read and write capabilities.

## Project Overview

This project aims to build an MCP server that connects Claude AI to Notion workspaces, allowing Claude to:

- Read content from Notion databases and pages
- Update existing content
- Search across your Notion workspace
- Query and filter database entries
- Retrieve detailed page content and database schemas

## Prerequisites

- Node.js (v16+)
- Notion API key
- Claude Desktop

## Getting Started

### 1. Set Up Notion API Access

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Name your integration (e.g. "Claude MCP Integration")
3. Set the integration type to "Internal"
4. Copy your API key
5. Share your Notion pages and databases with the integration by clicking the "..." menu in the top right of any page/database and selecting "Add connections"

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with your Notion API key:

```
NOTION_API_KEY=your_api_key_here
```

This step is only needed if you're developing the server.

### 4. Build

Build the server, ready to be used by Claude.

```bash
npm run build
```

If you're developing the server, you can run `npm run dev` or `npm run inspect`.

### 5. Add to Claude Desktop config

Open `claude_desktop_config.json` (navigate to `Settings > Developer` and click `Edit Config`) and add the following:

```json
"notion": {
  "command": "node",
  "args": [
    "path/to/mcp-server-notion/dist/index.js"
  ],
  "env": {
    "NOTION_API_KEY": "your_notion_api_key_here"
  }
}
```

### 6. Restart Claude

Restart Claude and you should be good to go!

## Available Features

The MCP server provides the following tools:

- `search_notion`: Search across your Notion workspace using a query string
- `get_notion_page`: Retrieve detailed content from a specific Notion page
- `get_notion_database`: Retrieve metadata and schema of a Notion database
- `query_notion_database`: Search and filter entries in a Notion database with support for complex queries

## Resources and References

- [Official Notion API Documentation](https://developers.notion.com)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Example MCP Server Implementations](https://github.com/modelcontextprotocol/servers)
- [Claude Developer Documentation](https://docs.anthropic.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.