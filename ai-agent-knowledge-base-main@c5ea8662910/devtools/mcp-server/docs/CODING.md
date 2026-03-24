# mcp-server Coding Conventions

MCP server providing semantic search over the Dynatrace DQL knowledge base using transformer embeddings.

## Build Commands

```bash
npm install          # install dependencies
npm run build        # build index (embeddings) + compile TypeScript
npm run build:index  # rebuild the semantic search index only (tsx scripts/build-index.ts)
npm run build:server # compile TypeScript only (tsc)
npm run dev          # build + run the server locally
```

The build has two stages:
1. **Index build** (`build:index`) -- scans `../../knowledge-base/`, generates embeddings with `Xenova/all-MiniLM-L6-v2`, writes `data/index.json`. Run this whenever knowledge base content changes.
2. **Server compile** (`build:server`) -- compiles `src/` to `dist/` via `tsc`.

## Testing

No automated tests exist. No test script in package.json.

Manual testing: run `./test-server.sh` which starts the server on stdio, then connect via VS Code MCP integration.

**TODO**: Add a test framework and basic test coverage. This needs an issue.

## Environment Variables

- `DT_TENANT` -- optional tenant name for filtering knowledge base entries. When set, includes `dynatrace/` (generic) and `customer/{tenant}/` entries. When unset, only generic content is served.

## Code Style

### TypeScript / ESM

- ESM modules throughout: `"type": "module"` in package.json
- Use `.js` extensions in all relative imports (required by ESM resolution):
  ```typescript
  import { searchKnowledgeBase } from './search.js';
  import type { KnowledgeIndex } from './types.js';
  ```
- TypeScript strict mode enabled (`"strict": true` in tsconfig.json)
- Target ES2022, module NodeNext, NodeNext module resolution

### Patterns

- `@modelcontextprotocol/sdk` for the MCP server and stdio transport
- `@xenova/transformers` for local embedding generation (model: `Xenova/all-MiniLM-L6-v2`)
- `fs/promises` for async file operations
- ESM `__dirname` equivalent:
  ```typescript
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  ```
- Lazy model initialization via singleton pattern (`getEmbedder()`)
- MCP tool handlers registered via `setRequestHandler` on the server instance

### Documentation

- JSDoc comments on all exported functions with `@param`, `@returns`, `@throws`
- Interface fields documented with `/** */` comments

### Error Handling

- Top-level `startServer()` catches fatal errors, logs with `console.error`, exits with code 1
- MCP tool handlers catch errors and return `{ isError: true }` responses
- `console.error` used for server logging (stdout is reserved for MCP protocol)

### Naming

- Files: kebab-case (`build-index.ts`, `search.ts`)
- Types/interfaces: PascalCase (`KnowledgeIndex`, `SearchResult`)
- Functions: camelCase (`searchKnowledgeBase`, `generateQueryEmbedding`)
- Constants: UPPER_SNAKE_CASE (`EMBEDDING_MODEL`, `KB_PATH`)

## Source Structure

```
src/
  index.ts              # Entry point (starts MCP server)
  server.ts             # MCP server setup, tool definitions, request handlers
  search.ts             # Semantic search (embedding generation, cosine similarity)
  types.ts              # Shared type definitions
scripts/
  build-index.ts        # Index builder (scans KB, generates embeddings, writes data/index.json)
data/
  index.json            # Pre-built search index (generated, not hand-edited)
```
