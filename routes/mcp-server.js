/**
 * MCP Server Route — Exposes BizObs dashboard generation as MCP tools.
 *
 * Uses the Model Context Protocol SDK with Streamable HTTP transport (stateless mode)
 * so any MCP client can consume it: AppEngine proxy (via EdgeConnect), VS Code, etc.
 *
 * Tools:
 *   - generate_dashboard: Generates a dashboard JSON for a given company & journey type
 *   - list_available_companies: Lists companies with active business events in Dynatrace
 */

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const router = express.Router();

// Import the generate function from the ai-dashboard route by re-using its logic.
// We call the local HTTP endpoint rather than importing internals directly — keeps coupling loose.
const SERVER_PORT = process.env.PORT || 8080;
const LOCAL_BASE = `http://127.0.0.1:${SERVER_PORT}`;

/**
 * Create a fresh McpServer instance.
 * In stateless mode we create a new server + transport per request.
 */
function createMcpServer() {
  const server = new McpServer(
    { name: 'bizobs-dashboard-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // ── Tool: generate_dashboard ──────────────────────────────────────────────
  server.tool(
    'generate_dashboard',
    'Generate a Dynatrace dashboard JSON for a specific company and journey type. ' +
    'Returns a complete dashboard document ready for import or deployment via the Document API.',
    {
      company: z.string().describe('Company name (e.g. "Acme Corp")'),
      journeyType: z.string().describe('Journey type (e.g. "Purchase", "Onboarding")'),
      useAI: z.boolean().optional().default(true).describe('Whether to use AI (Ollama) for generation. Falls back to template if unavailable.'),
    },
    async ({ company, journeyType, useAI }) => {
      try {
        console.log(`[MCP] 🛠️  generate_dashboard called: company=${company}, journeyType=${journeyType}, useAI=${useAI}`);
        const res = await fetch(`${LOCAL_BASE}/api/ai-dashboard/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            journeyData: { company, journeyType },
            useAI,
          }),
          signal: AbortSignal.timeout(30000),
        });

        const data = await res.json();
        if (!data.success || !data.dashboard) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: data.error || 'Dashboard generation failed' }) }],
            isError: true,
          };
        }

        console.log(`[MCP] ✅ Dashboard generated: ${Object.keys(data.dashboard.content?.tiles || {}).length} tiles via ${data.generationMethod}`);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              dashboard: data.dashboard,
              generationMethod: data.generationMethod,
              tileCount: Object.keys(data.dashboard.content?.tiles || {}).length,
              message: data.message,
            }),
          }],
        };
      } catch (err) {
        console.error('[MCP] generate_dashboard error:', err.message);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
          isError: true,
        };
      }
    }
  );

  // ── Tool: prompt_dashboard ─────────────────────────────────────────────────
  server.tool(
    'prompt_dashboard',
    'Generate a custom Dynatrace dashboard based on a natural language prompt. ' +
    'The user describes what kind of dashboard they want (e.g. "C-level executive dashboard", ' +
    '"ops team SLA dashboard") and the AI tailors the dashboard accordingly.',
    {
      company: z.string().describe('Company name (e.g. "Acme Corp")'),
      journeyType: z.string().describe('Journey type (e.g. "Purchase", "Onboarding")'),
      prompt: z.string().describe('Natural language description of the dashboard the user wants (e.g. "Create a C-level executive dashboard focused on revenue impact and customer churn")'),
    },
    async ({ company, journeyType, prompt }) => {
      try {
        console.log(`[MCP] 🎯 prompt_dashboard called: "${prompt.substring(0, 80)}..." for ${company}/${journeyType}`);
        const res = await fetch(`${LOCAL_BASE}/api/ai-dashboard/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            journeyData: { company, journeyType },
            useAI: true,
            customPrompt: prompt,
          }),
          signal: AbortSignal.timeout(120000), // Custom prompts may take longer with Ollama
        });

        const data = await res.json();
        if (!data.success || !data.dashboard) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: data.error || 'Custom dashboard generation failed' }) }],
            isError: true,
          };
        }

        console.log(`[MCP] ✅ Custom dashboard generated: ${Object.keys(data.dashboard.content?.tiles || {}).length} tiles via ${data.generationMethod}`);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              dashboard: data.dashboard,
              generationMethod: data.generationMethod,
              tileCount: Object.keys(data.dashboard.content?.tiles || {}).length,
              message: data.message,
              customPrompt: prompt,
            }),
          }],
        };
      } catch (err) {
        console.error('[MCP] prompt_dashboard error:', err.message);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
          isError: true,
        };
      }
    }
  );

  // ── Tool: get_dashboard_health ─────────────────────────────────────────────
  server.tool(
    'get_dashboard_health',
    'Check the health of the AI dashboard generation engine (Ollama availability, installed models).',
    {},
    async () => {
      try {
        const res = await fetch(`${LOCAL_BASE}/api/ai-dashboard/health`, {
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        return { content: [{ type: 'text', text: JSON.stringify(data) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
          isError: true,
        };
      }
    }
  );

  return server;
}

// ── Stateless Streamable HTTP endpoint ──────────────────────────────────────
// Each request creates a fresh transport + server, handles it, then cleans up.
// This is the recommended pattern for stateless MCP over HTTP.

router.post('/', async (req, res) => {
  try {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless — no session tracking
    });

    // Wire up error handling
    transport.onerror = (err) => console.error('[MCP Transport] Error:', err.message);

    // Connect server to transport, then handle the request
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('[MCP] Request handling error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error' }, id: null });
    }
  }
});

// GET endpoint for SSE stream (optional, for server-initiated notifications)
router.get('/', async (req, res) => {
  // In stateless mode, GET SSE is not meaningful — return method not allowed
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'SSE not supported in stateless mode. Use POST.' }, id: null });
});

// DELETE endpoint for session termination (no-op in stateless mode)
router.delete('/', (req, res) => {
  res.status(200).end();
});

console.log('[MCP Server] 🔗 MCP route registered at /api/mcp');

export default router;
