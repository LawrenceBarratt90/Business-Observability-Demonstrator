import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { KnowledgeIndex, KnowledgeEntry, Embedding } from './types.js';
import { searchKnowledgeBase } from './search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read tenant context from environment
const DT_TENANT = process.env.DT_TENANT || null;

/**
 * Load the pre-built knowledge base index
 */
async function loadIndex(): Promise<KnowledgeIndex> {
  const indexPath = join(__dirname, '..', 'data', 'index.json');
  const data = await readFile(indexPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Filter entries and embeddings based on active tenant context
 */
function filterByTenant(
  entries: KnowledgeEntry[],
  embeddings: Embedding[],
  tenant: string | null
): { entries: KnowledgeEntry[]; embeddings: Embedding[] } {
  // Filter entries
  const filteredEntries = entries.filter(entry => {
    // Always include generic dynatrace content
    if (entry.name.startsWith('dynatrace/')) {
      return true;
    }
    
    // If no tenant, exclude all customer content
    if (!tenant) {
      return false;
    }
    
    // Include only matching tenant content (case-sensitive)
    if (entry.name.startsWith(`customer/${tenant}/`)) {
      return true;
    }
    
    return false;
  });
  
  // Filter embeddings to match filtered entries
  const entryNames = new Set(filteredEntries.map(e => e.name));
  const filteredEmbeddings = embeddings.filter(emb => entryNames.has(emb.name));
  
  return { entries: filteredEntries, embeddings: filteredEmbeddings };
}

/**
 * Define the MCP tools
 */
const TOOLS: Tool[] = [
  {
    name: 'search_knowledgebase',
    description: 'Search the Dynatrace DQL knowledge base using semantic search and retrieve full content immediately. Returns relevant entries with their names, descriptions, full content, and relevance scores in a single call.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for finding relevant Dynatrace DQL knowledge base entries (e.g., "How to analyze slow traces", "aggregate spans by service")'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10
        }
      },
      required: ['query']
    }
  }
];

/**
 * Create and configure the MCP server
 */
export async function createServer() {
  const server = new Server(
    {
      name: 'dql-kb-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Load the knowledge base index
  let index: KnowledgeIndex;
  try {
    index = await loadIndex();
    console.error(`✓ Loaded knowledge base with ${index.metadata.entryCount} entries`);
    console.error(`✓ Tenant context: ${DT_TENANT || 'none (generic content only)'}`);
  } catch (error) {
    console.error('✗ Failed to load knowledge base index:', error);
    throw error;
  }

  // Handle tool listing
  (server as any).setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS
  }));

  // Handle tool calls
  (server as any).setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'search_knowledgebase') {
        if (!args) {
          throw new Error('Arguments are required');
        }
        
        const query = args.query as string;
        const limit = (args.limit as number) || 10;

        if (!query || typeof query !== 'string') {
          throw new Error('Query parameter is required and must be a string');
        }

        // Apply tenant filtering
        const filtered = filterByTenant(index.entries, index.embeddings, DT_TENANT);
        const filteredIndex: KnowledgeIndex = {
          ...index,
          entries: filtered.entries,
          embeddings: filtered.embeddings
        };

        console.error(`🔍 Searching for: "${query}" (limit: ${limit}, entries: ${filtered.entries.length})`);
        const results = await searchKnowledgeBase(filteredIndex, query, limit);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ Error in ${name}:`, errorMessage);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: errorMessage })
          }
        ],
        isError: true
      };
    }
  });

  return server;
}

/**
 * Start the MCP server
 */
export async function startServer(): Promise<void> {
  console.error('🚀 Starting Knowledge Base MCP Server...');
  
  const server = await createServer();
  const transport = new StdioServerTransport();
  
  await (server as any).connect(transport);
  console.error('✓ Server running and ready to accept requests');
}
