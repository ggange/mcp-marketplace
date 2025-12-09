import type { MCPApp, AppManifest, MCPServer } from '@mcp-marketplace/types';

/**
 * Configuration options for the MarketplaceClient.
 */
export interface MarketplaceClientConfig {
  /** Base URL of the marketplace API (e.g., 'https://marketplace.example.com') */
  baseUrl: string;
  /** API key for authentication (mutually exclusive with token) */
  apiKey?: string;
  /** Bearer token for authentication (mutually exclusive with apiKey) */
  token?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Function to retrieve the current user's ID (default: () => 'dev') */
  getUserId?: () => string;
}

/**
 * Filters for querying apps from the marketplace.
 */
export interface AppFilters {
  /** Search query to filter apps by name or description */
  search?: string;
  /** Filter apps by category */
  category?: string;
  /** Filter apps by visibility scope */
  visibility?: 'private' | 'global';
}

/**
 * Health status response for external API apps.
 */
export interface HealthStatus {
  /** Whether the app's API endpoint is healthy */
  healthy: boolean;
  /** Response latency in milliseconds */
  latency?: number;
  /** Error message if the health check failed */
  error?: string;
}

/**
 * Response from adding an app to a user's account.
 */
export interface AddToAccountResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Human-readable result message */
  message: string;
  /** The server configuration if the app was added */
  server?: MCPServer;
}

/**
 * Error response structure from the marketplace API.
 */
interface ApiErrorResponse {
  error?: string;
  code?: string;
}

/**
 * Custom error class for marketplace API errors.
 * Provides structured error information for better error handling.
 */
export class MarketplaceError extends Error {
  /** HTTP status code of the failed response */
  public readonly statusCode?: number;
  /** Error code from the API response */
  public readonly code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'MarketplaceError';
    this.statusCode = statusCode;
    this.code = code;
    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MarketplaceError);
    }
  }
}

/**
 * Marketplace Client SDK.
 * Provides a unified interface for accessing the marketplace API.
 * Works in both browser and Node.js environments.
 *
 * @example
 * ```typescript
 * const client = new MarketplaceClient({
 *   baseUrl: 'https://marketplace.example.com',
 *   apiKey: 'your-api-key'
 * });
 *
 * const apps = await client.listApps();
 * ```
 */
export class MarketplaceClient {
  private readonly config: Required<Pick<MarketplaceClientConfig, 'baseUrl' | 'timeout'>> &
    Omit<MarketplaceClientConfig, 'timeout'>;

  /**
   * Creates a new MarketplaceClient instance.
   * @param config - Configuration options for the client
   */
  constructor(config: MarketplaceClientConfig) {
    this.config = {
      timeout: 30000,
      getUserId: () => 'dev',
      ...config
    };
  }

  /**
   * Builds the default headers for API requests.
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add user ID
    const userId = this.config.getUserId?.() ?? 'dev';
    headers['x-user-id'] = userId;

    // Add authentication
    if (this.config.apiKey) {
      headers['x-api-key'] = this.config.apiKey;
    } else if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    return headers;
  }

  /**
   * Performs a fetch request with timeout support.
   * @param url - The URL to fetch
   * @param options - Fetch options
   * @returns The Response object
   * @throws {MarketplaceError} If the request times out
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Check if body is FormData - if so, don't set Content-Type (let browser set it with boundary)
      const isFormData = options.body instanceof FormData;

      // Build headers
      let headers: Record<string, string>;

      if (isFormData) {
        // For FormData, manually build headers without Content-Type
        const userId = this.config.getUserId?.() ?? 'dev';
        headers = {
          'x-user-id': userId
        };

        // Add authentication if provided
        if (this.config.apiKey) {
          headers['x-api-key'] = this.config.apiKey;
        } else if (this.config.token) {
          headers['Authorization'] = `Bearer ${this.config.token}`;
        }
      } else {
        // For non-FormData, use default headers (includes Content-Type: application/json)
        headers = this.getHeaders();
      }

      // Merge with options.headers (options.headers take precedence)
      const finalHeaders: Record<string, string> = {
        ...headers,
        ...(options.headers as Record<string, string>)
      };

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: finalHeaders
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new MarketplaceError('Request timeout', 408);
      }
      throw error;
    }
  }

  /**
   * Parses an error response from the API.
   * @param response - The Response object
   * @param fallbackMessage - Default message if parsing fails
   */
  private async parseErrorResponse(response: Response, fallbackMessage: string): Promise<MarketplaceError> {
    try {
      const errorData = (await response.json()) as ApiErrorResponse;
      return new MarketplaceError(
        errorData.error ?? fallbackMessage,
        response.status,
        errorData.code
      );
    } catch {
      return new MarketplaceError(fallbackMessage, response.status);
    }
  }

  /**
   * Lists all available apps with optional filters.
   * @param filters - Optional filters to apply
   * @returns Array of matching apps
   * @throws {MarketplaceError} If the request fails
   */
  async listApps(filters?: AppFilters): Promise<MCPApp[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);

    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps?${params.toString()}`
    );

    if (!response.ok) {
      throw await this.parseErrorResponse(response, 'Failed to fetch apps');
    }

    const data = (await response.json()) as { apps?: MCPApp[] };
    return data.apps ?? [];
  }

  /**
   * Gets detailed information about a specific app.
   * @param appId - The unique identifier of the app
   * @returns The app details
   * @throws {MarketplaceError} If the app is not found or request fails
   */
  async getApp(appId: string): Promise<MCPApp> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${encodeURIComponent(appId)}`
    );

    if (!response.ok) {
      throw await this.parseErrorResponse(response, `Failed to fetch app: ${appId}`);
    }

    const data = (await response.json()) as { app: MCPApp };
    return data.app;
  }

  /**
   * Searches apps by query string.
   * @param query - The search query
   * @param filters - Optional additional filters
   * @returns Array of matching apps
   * @throws {MarketplaceError} If the request fails
   */
  async searchApps(query: string, filters?: AppFilters): Promise<MCPApp[]> {
    return this.listApps({ ...filters, search: query });
  }

  /**
   * Downloads an app package as a Blob.
   * @param appId - The unique identifier of the app
   * @param version - Optional specific version to download
   * @returns The app package as a Blob
   * @throws {MarketplaceError} If the download fails
   */
  async downloadApp(appId: string, version?: string): Promise<Blob> {
    const url = version
      ? `${this.config.baseUrl}/api/apps/${encodeURIComponent(appId)}/download?version=${encodeURIComponent(version)}`
      : `${this.config.baseUrl}/api/apps/${encodeURIComponent(appId)}/download`;

    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      throw await this.parseErrorResponse(response, `Failed to download app: ${appId}`);
    }

    return response.blob();
  }

  /**
   * Gets the manifest for a specific app.
   * @param appId - The unique identifier of the app
   * @returns The app manifest
   * @throws {MarketplaceError} If the manifest cannot be fetched
   */
  async getAppManifest(appId: string): Promise<AppManifest> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${encodeURIComponent(appId)}/manifest`
    );

    if (!response.ok) {
      throw await this.parseErrorResponse(response, `Failed to fetch manifest: ${appId}`);
    }

    const data = (await response.json()) as { manifest: AppManifest };
    return data.manifest;
  }

  /**
   * Uploads an app package to the marketplace.
   * @param file - The app package file (File, Blob, or Buffer)
   * @param visibility - Whether the app should be private or globally visible
   * @returns The created app
   * @throws {MarketplaceError} If the upload fails
   */
  async uploadApp(
    file: File | Blob | Buffer,
    visibility: 'private' | 'global'
  ): Promise<MCPApp> {
    const formData = new FormData();

    // Handle different file types
    if (file instanceof File) {
      formData.append('package', file);
    } else if (file instanceof Blob) {
      formData.append('package', file, 'app.zip');
    } else {
      // Buffer (Node.js) - convert to Blob
      const blob = new Blob([file as BlobPart]);
      formData.append('package', blob, 'app.zip');
    }

    formData.append('visibility', visibility);

    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw await this.parseErrorResponse(response, 'Upload failed');
    }

    const data = (await response.json()) as { app: MCPApp };
    return data.app;
  }

  /**
   * Checks the health status of an external API app.
   * @param appId - The unique identifier of the app
   * @returns The health status
   * @throws {MarketplaceError} If the health check fails
   */
  async getAppHealth(appId: string): Promise<HealthStatus> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${encodeURIComponent(appId)}/health`
    );

    if (!response.ok) {
      throw await this.parseErrorResponse(response, 'Health check failed');
    }

    return (await response.json()) as HealthStatus;
  }

  /**
   * Deletes an app from the marketplace.
   * Only succeeds if the current user owns the app.
   * @param appId - The unique identifier of the app to delete
   * @throws {MarketplaceError} If deletion fails or user lacks permission
   */
  async deleteApp(appId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${encodeURIComponent(appId)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      throw await this.parseErrorResponse(response, 'Failed to delete app');
    }
  }

  /**
   * Adds an app to the current user's account.
   * Only works for external API apps that can run in the browser.
   * @param appId - The unique identifier of the app
   * @returns The result of the operation
   * @throws {MarketplaceError} If the operation fails
   */
  async addAppToAccount(appId: string): Promise<AddToAccountResponse> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${encodeURIComponent(appId)}/add-to-account`,
      {
        method: 'POST'
      }
    );

    if (!response.ok) {
      throw await this.parseErrorResponse(response, 'Failed to add app to account');
    }

    return (await response.json()) as AddToAccountResponse;
  }
}

/**
 * Creates a new MarketplaceClient instance with the provided configuration.
 *
 * @param config - Configuration options for the client
 * @returns A configured MarketplaceClient instance
 *
 * @example
 * ```typescript
 * const client = createMarketplaceClient({
 *   baseUrl: 'https://marketplace.example.com',
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export function createMarketplaceClient(config: MarketplaceClientConfig): MarketplaceClient {
  return new MarketplaceClient(config);
}

/** Window object augmented with marketplace configuration */
interface MarketplaceWindow {
  MARKETPLACE_URL?: string;
  MARKETPLACE_API_KEY?: string;
  MARKETPLACE_TOKEN?: string;
}

/**
 * Creates a MarketplaceClient using environment variables or window globals.
 *
 * Reads configuration from:
 * - `MARKETPLACE_URL` - Base URL for the marketplace API
 * - `MARKETPLACE_API_KEY` - API key for authentication
 * - `MARKETPLACE_TOKEN` - Bearer token for authentication
 *
 * @param getUserId - Optional function to retrieve the current user's ID
 * @returns A configured MarketplaceClient instance
 *
 * @example
 * ```typescript
 * // Node.js with environment variables
 * const client = createMarketplaceClientFromEnv();
 *
 * // Browser with custom getUserId
 * const client = createMarketplaceClientFromEnv(() => currentUser.id);
 * ```
 */
export function createMarketplaceClientFromEnv(
  getUserId?: () => string
): MarketplaceClient {
  const win = typeof window !== 'undefined' ? (window as unknown as MarketplaceWindow) : undefined;

  const baseUrl =
    (typeof process !== 'undefined' ? process.env?.['MARKETPLACE_URL'] : undefined) ??
    win?.MARKETPLACE_URL ??
    'http://localhost:3002';

  const apiKey =
    (typeof process !== 'undefined' ? process.env?.['MARKETPLACE_API_KEY'] : undefined) ??
    win?.MARKETPLACE_API_KEY;

  const token =
    (typeof process !== 'undefined' ? process.env?.['MARKETPLACE_TOKEN'] : undefined) ??
    win?.MARKETPLACE_TOKEN;

  return new MarketplaceClient({
    baseUrl,
    apiKey,
    token,
    getUserId
  });
}

