#!/usr/bin/env node
/**
 * Direct MCP Test - Call claude-prompts MCP server directly
 * This tests if we can invoke the MCP tools from Node.js
 *
 * MCP Protocol: Uses JSON-RPC 2.0 over stdio
 * - Initialize connection first
 * - Then call tools
 */

import { spawn } from 'child_process';

// MCP server path from settings.json
const mcpServerPath = 'C:/Users/HeinvanVuuren/claude-prompts-mcp/server/dist/index.js';

console.log('Testing MCP call to claude-prompts...');
console.log('Server:', mcpServerPath);

// Spawn the MCP server
const mcp = spawn('node', [mcpServerPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';
let messageBuffer = '';

mcp.stdout.on('data', (data) => {
  const chunk = data.toString();
  output += chunk;
  messageBuffer += chunk;

  // Try to parse JSON-RPC messages
  const lines = messageBuffer.split('\n');
  messageBuffer = lines.pop() || ''; // Keep incomplete line

  lines.forEach(line => {
    if (line.trim()) {
      console.log('STDOUT:', line);
      try {
        const msg = JSON.parse(line);
        console.log('Parsed message:', JSON.stringify(msg, null, 2));
      } catch (e) {
        console.log('Not JSON:', line);
      }
    }
  });
});

mcp.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.error('STDERR:', data.toString());
});

mcp.on('close', (code) => {
  console.log(`\nProcess exited with code ${code}`);
  console.log('\n=== Full Output ===');
  console.log(output);
  console.log('\n=== Full Error ===');
  console.log(errorOutput);
  process.exit(code || 0);
});

// MCP JSON-RPC 2.0 Protocol
// Step 1: Initialize the connection
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

console.log('\nSending initialize request:', JSON.stringify(initRequest));
mcp.stdin.write(JSON.stringify(initRequest) + '\n');

// Step 2: After initialize, call the prompt_engine tool
setTimeout(() => {
  const toolCall = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'prompt_engine',
      arguments: {
        command: '>>enhance_research_prompt short_prompt="test JWT security" depth_level="extensive"'
      }
    }
  };

  console.log('\nSending tool call:', JSON.stringify(toolCall));
  mcp.stdin.write(JSON.stringify(toolCall) + '\n');

  // Close after sending
  setTimeout(() => {
    mcp.stdin.end();
  }, 1000);
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\nTimeout - killing process');
  mcp.kill();
  process.exit(1);
}, 10000);
