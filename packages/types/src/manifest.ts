/**
 * Configuration for locally-executed MCP apps.
 * These apps run as child processes on the user's machine.
 */
export interface AppManifestLocal {
  /** Command to execute (e.g., 'node', 'python', 'npx') */
  command: string;
  /** Arguments to pass to the command */
  args?: string[];
  /** Environment variables to set for the process */
  env?: Record<string, string>;
  /** Configuration keys that must be provided by the user */
  requiresConfig?: string[];
}

/**
 * Configuration for external API-based MCP apps.
 * These apps communicate with a remote server.
 */
export interface AppManifestExternalApi {
  /** The API endpoint URL */
  endpoint: string;
  /** Transport protocol for communication */
  transport: 'sse' | 'http';
  /** Authentication configuration */
  auth: {
    /** Authentication type */
    type: 'bearer' | 'api-key' | 'none';
    /** Custom header name for authentication (if not using standard Authorization) */
    header?: string;
    /** Configuration key for the auth value */
    configKey?: string;
  };
}

/**
 * App manifest structure defining an MCP application.
 * Used for packaging and distributing apps.
 */
export interface AppManifest {
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
  /** Semantic version string (e.g., '1.0.0') */
  version: string;
  /** Author name or organization */
  author?: string;
  /** App execution type */
  type: 'local' | 'external-api';
  /** Configuration for local apps */
  local?: AppManifestLocal;
  /** Configuration for external API apps */
  externalApi?: AppManifestExternalApi;
  /** Visibility scope of the app */
  visibility?: 'private' | 'global';
}



