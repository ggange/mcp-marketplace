# @mcp-marketplace/types

TypeScript type definitions for the MCP (Model Context Protocol) App Marketplace.

## Installation

```bash
npm install @mcp-marketplace/types
```

## Usage

Import the types you need:

```typescript
import type { 
  MCPApp, 
  AppManifest, 
  MCPServer, 
  MCPTool,
  ToolUsage 
} from '@mcp-marketplace/types';
```

## Type Definitions

### MCPApp

Represents an MCP app in the marketplace:

```typescript
interface MCPApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  version?: string;
  author?: string;
  type?: 'local' | 'external-api';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  requiresConfig?: string[];
  source: 'native' | 'custom' | 'uploaded';
  installed?: boolean;
  relevance?: number;
  visibility?: 'private' | 'global';
  userId?: string;
  // External API specific
  endpoint?: string;
  transport?: 'sse' | 'http';
  authType?: 'bearer' | 'api-key' | 'none';
  authHeader?: string;
  authConfigKey?: string;
}
```

### AppManifest

App manifest structure for local and external API apps:

```typescript
interface AppManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  version: string;
  author?: string;
  type: 'local' | 'external-api';
  local?: AppManifestLocal;
  externalApi?: AppManifestExternalApi;
  visibility?: 'private' | 'global';
}
```

### MCPServer

Server configuration for MCP apps:

```typescript
interface MCPServer {
  id: string;
  name: string;
  type?: 'local' | 'external-api';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  connected: boolean;
  endpoint?: string;
  transport?: 'sse' | 'http';
  authType?: 'bearer' | 'api-key' | 'none';
  authHeader?: string;
  authConfigKey?: string;
}
```

### MCPTool

Tool definition for MCP servers:

```typescript
interface MCPTool {
  name: string;
  description: string;
  serverId: string;
  inputSchema: Record<string, any>;
}
```

### ToolUsage

Tool usage tracking:

```typescript
interface ToolUsage {
  id: string;
  serverId: string;
  serverName: string;
  toolName: string;
  toolDescription: string;
  args: Record<string, any>;
  result?: any;
  timestamp: string;
  duration?: number;
  success: boolean;
  error?: string;
}
```

## License

MIT License

## Repository

- GitHub: [https://github.com/ggange/mcp-marketplace](https://github.com/ggange/mcp-marketplace)
- npm: [@mcp-marketplace/types](https://www.npmjs.com/package/@mcp-marketplace/types)

