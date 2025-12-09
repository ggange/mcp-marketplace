# @mcp-marketplace/client-sdk

TypeScript SDK for accessing the MCP (Model Context Protocol) App Marketplace API. Works in both browser and Node.js environments.

## Installation

```bash
npm install @mcp-marketplace/client-sdk
```

## Quick Start

```typescript
import { createMarketplaceClient } from '@mcp-marketplace/client-sdk';

const client = createMarketplaceClient({
  baseUrl: 'https://marketplace.example.com',
  apiKey: 'your-api-key', // optional
  getUserId: () => 'user-123' // optional
});

// List all apps
const apps = await client.listApps();
```

## Configuration

### Basic Configuration

```typescript
import { MarketplaceClient } from '@mcp-marketplace/client-sdk';

const client = new MarketplaceClient({
  baseUrl: 'https://marketplace.example.com',
  apiKey: 'your-api-key', // optional
  token: 'bearer-token', // optional, alternative to apiKey
  timeout: 30000, // optional, default: 30000ms
  getUserId: () => 'user-id' // optional, default: 'dev'
});
```

### Environment Variables

You can also create a client from environment variables:

```typescript
import { createMarketplaceClientFromEnv } from '@mcp-marketplace/client-sdk';

const client = createMarketplaceClientFromEnv(
  () => 'user-id' // optional getUserId function
);
```

Environment variables:
- `MARKETPLACE_URL` - Base URL for the marketplace API
- `MARKETPLACE_API_KEY` - API key for authentication
- `MARKETPLACE_TOKEN` - Bearer token for authentication

## API Methods

### listApps(filters?)

List all available apps with optional filters.

```typescript
const apps = await client.listApps({
  search: 'weather',
  category: 'tools',
  visibility: 'global' // or 'private'
});
```

**Parameters:**
- `filters?` - Optional filters object:
  - `search?: string` - Search query
  - `category?: string` - Filter by category
  - `visibility?: 'private' | 'global'` - Filter by visibility

**Returns:** `Promise<MCPApp[]>`

### getApp(appId)

Get detailed information about a specific app.

```typescript
const app = await client.getApp('app-id');
```

**Parameters:**
- `appId: string` - The app ID

**Returns:** `Promise<MCPApp>`

### searchApps(query, filters?)

Search apps by query string.

```typescript
const results = await client.searchApps('weather', {
  category: 'tools'
});
```

**Parameters:**
- `query: string` - Search query
- `filters?` - Optional filters (same as `listApps`)

**Returns:** `Promise<MCPApp[]>`

### downloadApp(appId, version?)

Download app package as a Blob.

```typescript
const blob = await client.downloadApp('app-id');
// or with version
const blob = await client.downloadApp('app-id', '1.0.0');
```

**Parameters:**
- `appId: string` - The app ID
- `version?: string` - Optional version string

**Returns:** `Promise<Blob>`

### getAppManifest(appId)

Get app manifest JSON.

```typescript
const manifest = await client.getAppManifest('app-id');
```

**Parameters:**
- `appId: string` - The app ID

**Returns:** `Promise<AppManifest>`

### uploadApp(file, visibility)

Upload app package (for developers).

```typescript
const file = new File([...], 'app.zip');
const app = await client.uploadApp(file, 'global');
```

**Parameters:**
- `file: File | Blob | Buffer` - The app package file
- `visibility: 'private' | 'global'` - App visibility

**Returns:** `Promise<MCPApp>`

### getAppHealth(appId)

Check health status of external API app.

```typescript
const health = await client.getAppHealth('app-id');
// { healthy: true, latency: 123 }
```

**Parameters:**
- `appId: string` - The app ID

**Returns:** `Promise<HealthStatus>`

### deleteApp(appId)

Delete an app (only if user owns it).

```typescript
await client.deleteApp('app-id');
```

**Parameters:**
- `appId: string` - The app ID

**Returns:** `Promise<void>`

### addAppToAccount(appId)

Add app to user's account (for use in chat UI). Only works for external API apps that can run in browser.

```typescript
const result = await client.addAppToAccount('app-id');
// { success: true, message: '...', server?: {...} }
```

**Parameters:**
- `appId: string` - The app ID

**Returns:** `Promise<{ success: boolean; message: string; server?: any }>`

## Browser Usage

The SDK works seamlessly in browser environments:

```typescript
import { createMarketplaceClient } from '@mcp-marketplace/client-sdk';

const client = createMarketplaceClient({
  baseUrl: window.MARKETPLACE_URL || 'https://marketplace.example.com',
  getUserId: () => getCurrentUserId()
});

const apps = await client.listApps();
```

## Node.js Usage

The SDK also works in Node.js environments:

```typescript
import { createMarketplaceClient } from '@mcp-marketplace/client-sdk';
import { readFileSync } from 'fs';

const client = createMarketplaceClient({
  baseUrl: process.env.MARKETPLACE_URL || 'https://marketplace.example.com',
  apiKey: process.env.MARKETPLACE_API_KEY
});

// Upload from Node.js
const buffer = readFileSync('app.zip');
const app = await client.uploadApp(buffer, 'global');
```

## Error Handling

All methods throw errors on failure:

```typescript
try {
  const app = await client.getApp('invalid-id');
} catch (error) {
  console.error('Failed to fetch app:', error.message);
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions. All types are exported from `@mcp-marketplace/types`:

```typescript
import type { MCPApp, AppManifest } from '@mcp-marketplace/client-sdk';
// or
import type { MCPApp, AppManifest } from '@mcp-marketplace/types';
```

## License

MIT License

## Repository

- GitHub: [https://github.com/ggange/mcp-marketplace](https://github.com/ggange/mcp-marketplace)
- npm: [@mcp-marketplace/client-sdk](https://www.npmjs.com/package/@mcp-marketplace/client-sdk)

