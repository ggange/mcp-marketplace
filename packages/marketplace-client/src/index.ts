export {
  MarketplaceClient,
  MarketplaceError,
  createMarketplaceClient,
  createMarketplaceClientFromEnv
} from './marketplace.js';

export type {
  MarketplaceClientConfig,
  AppFilters,
  HealthStatus,
  AddToAccountResponse
} from './marketplace.js';

export type {
  MCPApp,
  AppManifest,
  MCPServer,
  MCPTool,
  ToolUsage,
  AppManifestLocal,
  AppManifestExternalApi
} from '@mcp-marketplace/types';
