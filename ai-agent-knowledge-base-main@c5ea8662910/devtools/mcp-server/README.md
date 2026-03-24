# Knowledge Base MCP Server

A Model Context Protocol (MCP) server that provides semantic search and content retrieval for the Dynatrace DQL knowledge base. This self-contained package includes pre-built vector embeddings for fast, intelligent search capabilities.

## Features

- **Semantic Search**: Natural language queries to find relevant DQL documentation
- **Content Retrieval**: Fetch full documentation for specific topics
- **Pre-built Embeddings**: Vector embeddings generated at build time for instant search
- **Self-Contained**: No external API dependencies, runs completely offline
- **VS Code Compatible**: Easy integration with VS Code and other MCP clients

## Installation

```bash
git clone <repository>
cd devtools/mcp-server
npm install
npm run build
npm install -g .
```

## Usage in VS Code

Add the following to your VS Code `settings.json`:

```json
{
  "mcpServers": {
    "dql-knowledgebase": {
      "command": "dql-kb-mcp"
    }
  }
}
```

## Available Tools

### `search_knowledgebase`

Search the Dynatrace DQL knowledge base using natural language queries and retrieve full content immediately.

**Parameters:**
- `query` (string, required): Search query describing what you're looking for
- `limit` (number, optional): Maximum number of results (default: 10)

**Returns:** Array of matching entries with:
- `name`: Entry identifier
- `description`: Brief description
- `content`: Full markdown documentation
- `category`: Documentation category
- `relevanceScore`: Similarity score (0-1)

**Example:**

```json
{
  "query": "How to analyze slow traces in DQL",
  "limit": 5
}
```

**Note:** This single tool call returns complete documentation immediately—no need for a separate content retrieval step.

## Tenant-Specific Filtering

The MCP server supports filtering content based on customer tenant context using the `DT_TENANT` environment variable.

### How It Works

**Knowledge Base Structure:**
- `dynatrace/*` - Generic Dynatrace knowledge (always included)
- `customer/<tenant-name>/*` - Tenant-specific content

**Filtering Behavior:**

| DT_TENANT Value | Content Returned |
|----------------|------------------|
| Not set | Only `dynatrace/*` (generic content) |
| `dt-selfmonitoring` | `dynatrace/*` + `customer/dt-selfmonitoring/*` |
| Unknown tenant (e.g., `demosystem`) | Only `dynatrace/*` (fallback to generic) |

### Configuration

**VS Code (`settings.json`):**
```json
{
  "mcpServers": {
    "dql-knowledgebase": {
      "command": "dql-kb-mcp",
      "env": {
        "DT_TENANT": "dt-selfmonitoring"
      }
    }
  }
}
```

**Command Line:**
```bash
DT_TENANT=dt-selfmonitoring dql-kb-mcp
```

**Notes:**
- Tenant names are **case-sensitive**
- If the specified tenant folder doesn't exist, only generic content is returned
- Only one tenant can be active at a time

## Example Workflow

**Search** for relevant documentation with full content:
```json
// Tool: search_knowledgebase
{
  "query": "aggregate spans by service name",
  "limit": 3
}
```

The response includes complete documentation for each result, ready to use immediately.

## Sample Queries

Here are some example queries you can try:

- "How do I filter traces by error status?"
- "Find examples of DQL aggregations with grouping"
- "Show me how to analyze Core Web Vitals"
- "Query Kubernetes pod metrics"
- "Calculate percentiles for response times"
- "Join spans with logs for correlation"

## Development

### Build the Index

The knowledge base index must be built before the server can run:

```bash
npm run build:index
```

This will:
1. Scan all markdown files in the knowledge base
2. Extract metadata and descriptions
3. Generate vector embeddings using the all-MiniLM-L6-v2 model
4. Save the index to `data/index.json`

### Build the Server

Compile TypeScript to JavaScript:

```bash
npm run build:server
```

### Full Build

Run both index and server build:

```bash
npm run build
```

### Run Locally

```bash
npm run dev
```

## Architecture

```
devtools/mcp-server/
├── src/
│   ├── index.ts          # Entry point
│   ├── server.ts         # MCP server implementation
│   ├── search.ts         # Semantic search logic
│   └── types.ts          # TypeScript type definitions
├── scripts/
│   └── build-index.ts    # Build-time indexing script
├── data/
│   └── index.json        # Pre-built knowledge base index
├── dist/                 # Compiled JavaScript
└── package.json
```

## Technology Stack

- **MCP SDK**: Model Context Protocol implementation
- **Transformers.js**: Local embedding generation (all-MiniLM-L6-v2)
- **TypeScript**: Type-safe development
- **Node.js**: Runtime environment

## Semantic Search Details

The semantic search uses:
- **Model**: all-MiniLM-L6-v2 (Sentence Transformers)
- **Vector Dimension**: 384
- **Similarity Metric**: Cosine similarity
- **Embedding Scope**: Entry name, description, and content (first 1000 chars)

All embeddings are pre-computed during the build process, ensuring fast query response times without requiring GPU or external API calls.

## Performance

- **Index Load Time**: < 1 second
- **Search Query Time**: < 100ms (after model initialization)
- **Model Initialization**: ~2-3 seconds (first query only)
- **Memory Usage**: ~200MB (including model and index)

## Troubleshooting

### Server Won't Start

- Ensure Node.js 20+ is installed
- Check that `data/index.json` exists (run `npm run build:index` if missing)

### Search Returns No Results

- Verify the index was built successfully
- Try broader search queries
- Check that knowledge base files exist in `../../knowledge-base/`

### VS Code Can't Find the Server

- Use full path to the executable in settings
- Ensure the package is installed globally or use npx
- Check VS Code's Output panel for MCP logs

## Contributing

To add new documentation to the knowledge base:

1. Add markdown files to `../../knowledge-base/documentation/`
2. Rebuild the index: `npm run build:index`
3. Test with sample queries

## License

MIT

## Support

For issues or questions, please contact the Dynatrace AI Agent Knowledge Base team.
