#!/bin/bash

# Simple test script for the MCP server
# This simulates what VS Code does when connecting to the server

echo "🧪 Testing Knowledge Base MCP Server"
echo "======================================"
echo ""
echo "Starting server (Ctrl+C to stop)..."
echo "Note: Server communicates via stdio (binary protocol)"
echo ""
echo "To properly test:"
echo "1. Add server to VS Code settings.json"
echo "2. Restart VS Code"
echo "3. Use AI assistant to call the tools"
echo ""
echo "Example queries to try:"
echo "  - 'Search for DQL trace analysis examples'"
echo "  - 'Find documentation about aggregations'"
echo "  - 'How to query Kubernetes metrics'"
echo ""
echo "Starting server now..."
echo ""

node dist/index.js
