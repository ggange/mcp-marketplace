# MCP Marketplace SDK

TypeScript SDK for accessing the MCP (Model Context Protocol) App Marketplace API. This monorepo contains two packages:

- **[@mcp-marketplace/types](./packages/types/)** - TypeScript type definitions for MCP Marketplace
- **[@mcp-marketplace/client-sdk](./packages/marketplace-client/)** - Full-featured client SDK for browser and Node.js

## Installation

### Types Package

```bash
npm install @mcp-marketplace/types
```

### Client SDK

```bash
npm install @mcp-marketplace/client-sdk
```

The client SDK includes the types package as a dependency, so you only need to install the client SDK if you're using the full API client.

## Quick Start

### Using the Client SDK

```typescript
import { createMarketplaceClient } from '@mcp-marketplace/client-sdk';

const client = createMarketplaceClient({
  baseUrl: 'https://marketplace.example.com',
  apiKey: 'your-api-key', // optional
  getUserId: () => 'user-123' // optional
});

// List all apps
const apps = await client.listApps();

// Search apps
const results = await client.searchApps('weather');

// Get app details
const app = await client.getApp('app-id');

// Download app package
const blob = await client.downloadApp('app-id');
```

### Using Types Only

```typescript
import type { MCPApp, AppManifest } from '@mcp-marketplace/types';

const app: MCPApp = {
  id: 'app-1',
  name: 'My App',
  // ...
};
```

## Packages

### [@mcp-marketplace/types](./packages/types/)

TypeScript type definitions for MCP Marketplace entities including:
- `MCPApp` - App metadata and configuration
- `AppManifest` - App manifest structure
- `MCPServer` - Server configuration
- `MCPTool` - Tool definitions

See the [types package README](./packages/types/README.md) for full documentation.

### [@mcp-marketplace/client-sdk](./packages/marketplace-client/)

Full-featured SDK with methods for:
- Listing and searching apps
- Getting app details and manifests
- Downloading app packages
- Uploading apps (for developers)
- Health checks
- Account management

See the [client SDK README](./packages/marketplace-client/README.md) for full API documentation.

## Development

This is a monorepo using npm workspaces.

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

This builds all packages in the workspace.

### Development Mode

```bash
npm run dev
```

Runs TypeScript compiler in watch mode for all packages.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Repository

- GitHub: [https://github.com/ggange/mcp-marketplace](https://github.com/ggange/mcp-marketplace)
- npm: [@mcp-marketplace/types](https://www.npmjs.com/package/@mcp-marketplace/types) | [@mcp-marketplace/client-sdk](https://www.npmjs.com/package/@mcp-marketplace/client-sdk)

## Author

Giuseppe Matteo Gangemi

