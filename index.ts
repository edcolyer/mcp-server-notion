import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import 'dotenv/config';
import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Create the MCP server
const server = new McpServer({
  name: 'Notion MCP Server',
  version: '1.0.0',
},
{
  capabilities: {
    prompts: {}
  }
});

server.tool(
  'search_notion',
  'Search Notion pages and databases using a query string. The pages/databases must have been shared with the Notion MCP Server integration.',
  {
    searchQuery: z.string().describe('The complete user query to search Notion for'),
  },
  async (searchQuery) => {
    try {
      // Search Notion using the provided query
      const response = await notion.search({
        query: searchQuery.searchQuery,
        page_size: 5,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error searching Notion:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error searching Notion: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  'get_notion_page',
  'Retrieve detailed content from a specific Notion page.',
  {
    pageId: z.string().describe('The ID of the Notion page to retrieve'),
  },
  async (params) => {
    try {
      // Retrieve the page metadata
      const page = await notion.pages.retrieve({ 
        page_id: params.pageId 
      });
      
      // Retrieve the page content (blocks)
      const blocks = await notion.blocks.children.list({
        block_id: params.pageId,
        page_size: 100, // Adjust as needed
      });
      
      // Format the response with both page metadata and content
      const result = {
        page: page,
        content: blocks.results
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error retrieving Notion page:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving Notion page: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  'get_notion_database',
  'Retrieve metadata and schema of a Notion database.',
  {
    databaseId: z.string().describe('The ID of the Notion database to retrieve'),
  },
  async (params) => {
    try {
      // Retrieve the database metadata and schema
      const database = await notion.databases.retrieve({ 
        database_id: params.databaseId 
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(database, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error retrieving Notion database:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving Notion database: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  'query_notion_database',
  'Search and filter entries in a Notion database.',
  {
    databaseId: z.string().describe('The ID of the Notion database to query'),
    filter: z.string().optional().describe('Optional JSON filter string to apply to the query'),
    sorts: z.string().optional().describe('Optional JSON sorts string to order the results'),
    pageSize: z.number().optional().default(10).describe('Number of results to return (max 100)'),
  },
  async (params) => {
    try {
      // Prepare query parameters
      const queryParams = {
        database_id: params.databaseId,
        page_size: params.pageSize || 10,
      } as any;

      // Add filter if provided
      if (params.filter) {
        try {
          queryParams.filter = JSON.parse(params.filter);
        } catch (e) {
          return {
            content: [
              {
                type: 'text',
                text: `Error parsing filter JSON: ${e instanceof Error ? e.message : String(e)}`,
              },
            ],
            isError: true,
          };
        }
      }

      // Add sorts if provided
      if (params.sorts) {
        try {
          queryParams.sorts = JSON.parse(params.sorts);
        } catch (e) {
          return {
            content: [
              {
                type: 'text',
                text: `Error parsing sorts JSON: ${e instanceof Error ? e.message : String(e)}`,
              },
            ],
            isError: true,
          };
        }
      }

      // Query the database
      const response = await notion.databases.query(queryParams);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error querying Notion database:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error querying Notion database: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  'get_notion_block',
  'Retrieve a specific Notion block by its ID.',
  {
    blockId: z.string().describe('The ID of the Notion block to retrieve'),
  },
  async (params) => {
    try {
      // Retrieve the block
      const block = await notion.blocks.retrieve({ 
        block_id: params.blockId 
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(block, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error retrieving Notion block:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving Notion block: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  'get_notion_block_children',
  'Retrieve child blocks of a specific Notion block.',
  {
    blockId: z.string().describe('The ID of the parent Notion block'),
    pageSize: z.number().optional().default(100).describe('Number of results to return (max 100)'),
    startCursor: z.string().optional().describe('Cursor for pagination'),
  },
  async (params) => {
    try {
      // Prepare query parameters
      const queryParams = {
        block_id: params.blockId,
        page_size: params.pageSize || 100,
      } as any;
      
      // Add start_cursor if provided
      if (params.startCursor) {
        queryParams.start_cursor = params.startCursor;
      }
      
      // Retrieve the block children
      const response = await notion.blocks.children.list(queryParams);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error retrieving Notion block children:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving Notion block children: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);