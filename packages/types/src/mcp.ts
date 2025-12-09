/**
 * Represents an MCP server instance configuration and state.
 */
export interface MCPServer {
  /** Unique identifier for the server */
  id: string;
  /** Display name of the server */
  name: string;
  /** Server execution type */
  type?: 'local' | 'external-api';
  /** Command for local servers */
  command?: string;
  /** Command arguments for local servers */
  args?: string[];
  /** Environment variables for local servers */
  env?: Record<string, string>;
  /** Whether the server is currently connected */
  connected: boolean;
  /** API endpoint for external servers */
  endpoint?: string;
  /** Transport protocol for external servers */
  transport?: 'sse' | 'http';
  /** Authentication type for external servers */
  authType?: 'bearer' | 'api-key' | 'none';
  /** Custom auth header name */
  authHeader?: string;
  /** Configuration key for auth value */
  authConfigKey?: string;
}

/**
 * Represents a tool exposed by an MCP server.
 */
export interface MCPTool {
  /** Unique name of the tool */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** ID of the server that provides this tool */
  serverId: string;
  /** JSON Schema describing the tool's input parameters */
  inputSchema: Record<string, unknown>;
}

/**
 * Represents an MCP app in the marketplace.
 */
export interface MCPApp {
  /** Unique identifier for the app */
  id: string;
  /** Display name of the app */
  name: string;
  /** Brief description of what the app does */
  description: string;
  /** Icon identifier or URL */
  icon: string;
  /** Category for marketplace organization */
  category: string;
  /** Semantic version string */
  version?: string;
  /** Author name or organization */
  author?: string;
  /** App execution type */
  type?: 'local' | 'external-api';
  /** Command for local apps */
  command?: string;
  /** Command arguments for local apps */
  args?: string[];
  /** Environment variables for local apps */
  env?: Record<string, string>;
  /** Configuration keys required by the app */
  requiresConfig?: string[];
  /** How the app was added to the marketplace */
  source: 'native' | 'custom' | 'uploaded';
  /** Whether the app is installed for the current user */
  installed?: boolean;
  /** Relevance score for tool suggestions (0-1) */
  relevance?: number;
  /** Visibility scope of the app */
  visibility?: 'private' | 'global';
  /** Owner's user ID (for private apps) */
  userId?: string;
  /** API endpoint for external apps */
  endpoint?: string;
  /** Transport protocol for external apps */
  transport?: 'sse' | 'http';
  /** Authentication type for external apps */
  authType?: 'bearer' | 'api-key' | 'none';
  /** Custom auth header name */
  authHeader?: string;
  /** Configuration key for auth value */
  authConfigKey?: string;
}

/**
 * Records a single tool invocation for analytics and debugging.
 */
export interface ToolUsage {
  /** Unique identifier for this usage record */
  id: string;
  /** ID of the server that executed the tool */
  serverId: string;
  /** Name of the server */
  serverName: string;
  /** Name of the tool that was called */
  toolName: string;
  /** Description of the tool */
  toolDescription: string;
  /** Arguments passed to the tool */
  args: Record<string, unknown>;
  /** Result returned by the tool */
  result?: unknown;
  /** ISO 8601 timestamp of when the tool was called */
  timestamp: string;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Whether the tool execution succeeded */
  success: boolean;
  /** Error message if the execution failed */
  error?: string;
}



