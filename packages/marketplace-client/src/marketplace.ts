import type { MCPApp, AppManifest } from '@mcp-marketplace/types';

export interface MarketplaceClientConfig {
  baseUrl: string;
  apiKey?: string;
  token?: string;
  timeout?: number;
  getUserId?: () => string;
}

export interface AppFilters {
  search?: string;
  category?: string;
  visibility?: 'private' | 'global';
}

export interface HealthStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
}

/**
 * Marketplace Client SDK
 * Provides a unified interface for accessing the marketplace API
 * Works in both browser and Node.js environments
 */
export class MarketplaceClient {
  private config: MarketplaceClientConfig;

  constructor(config: MarketplaceClientConfig) {
    this.config = {
      timeout: 30000,
      getUserId: () => 'dev',
      ...config
    };
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    // Add user ID
    const userId = this.config.getUserId?.() || 'dev';
    headers['x-user-id'] = userId;

    // Add authentication
    if (this.config.apiKey) {
      headers['x-api-key'] = this.config.apiKey;
    } else if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    return headers;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Check if body is FormData - if so, don't set Content-Type (let browser set it with boundary)
      const isFormData = options.body instanceof FormData;
      
      // Build headers
      let headers: HeadersInit;
      
      if (isFormData) {
        // For FormData, manually build headers without Content-Type
        const userId = this.config.getUserId?.() || 'dev';
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
      const finalHeaders: HeadersInit = {
        ...(headers as Record<string, string>),
        ...(options.headers as Record<string, string>)
      };
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: finalHeaders
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * List all available apps with optional filters
   */
  async listApps(filters?: AppFilters): Promise<MCPApp[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);

    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps?${params}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch apps' })) as { error?: string };
      throw new Error(error.error || 'Failed to fetch apps');
    }

    const data = await response.json() as { apps?: MCPApp[] };
    return data.apps || [];
  }

  /**
   * Get detailed information about a specific app
   */
  async getApp(appId: string): Promise<MCPApp> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${appId}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch app' })) as { error?: string };
      throw new Error(error.error || `Failed to fetch app: ${appId}`);
    }

    const data = await response.json() as { app: MCPApp };
    return data.app;
  }

  /**
   * Search apps by query string
   */
  async searchApps(query: string, filters?: AppFilters): Promise<MCPApp[]> {
    return this.listApps({ ...filters, search: query });
  }

  /**
   * Download app package as a Blob
   */
  async downloadApp(appId: string, version?: string): Promise<Blob> {
    const url = version
      ? `${this.config.baseUrl}/api/apps/${appId}/download?version=${version}`
      : `${this.config.baseUrl}/api/apps/${appId}/download`;

    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to download app' })) as { error?: string };
      throw new Error(error.error || `Failed to download app: ${appId}`);
    }

    return await response.blob();
  }

  /**
   * Get app manifest JSON
   */
  async getAppManifest(appId: string): Promise<AppManifest> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${appId}/manifest`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch manifest' })) as { error?: string };
      throw new Error(error.error || `Failed to fetch manifest: ${appId}`);
    }

    const data = await response.json() as { manifest: AppManifest };
    return data.manifest;
  }

  /**
   * Upload app package (for developers)
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

    const userId = this.config.getUserId?.() || 'dev';
    
    // Don't set Content-Type for FormData - let the browser/runtime set it with boundary
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/upload`,
      {
        method: 'POST',
        headers: {
          'x-user-id': userId
          // Don't set Content-Type - FormData will set it with boundary
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' })) as { error?: string };
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json() as { app: MCPApp };
    return data.app;
  }

  /**
   * Check health status of external API app
   */
  async getAppHealth(appId: string): Promise<HealthStatus> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${appId}/health`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Health check failed' })) as { error?: string };
      throw new Error(error.error || 'Health check failed');
    }

    return await response.json() as HealthStatus;
  }

  /**
   * Delete an app (only if user owns it)
   */
  async deleteApp(appId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${appId}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete app' })) as { error?: string };
      throw new Error(error.error || 'Failed to delete app');
    }
  }

  /**
   * Add app to user's account (for use in chat UI)
   * Only works for external API apps that can run in browser
   */
  async addAppToAccount(appId: string): Promise<{ success: boolean; message: string; server?: any }> {
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/api/apps/${appId}/add-to-account`,
      {
        method: 'POST'
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to add app to account' })) as { error?: string; code?: string };
      throw new Error(error.error || 'Failed to add app to account');
    }

    return await response.json() as { success: boolean; message: string; server?: any };
  }
}

/**
 * Create a marketplace client instance
 */
export function createMarketplaceClient(config: MarketplaceClientConfig): MarketplaceClient {
  return new MarketplaceClient(config);
}

/**
 * Create a marketplace client from environment variables
 */
export function createMarketplaceClientFromEnv(
  getUserId?: () => string
): MarketplaceClient {
  const baseUrl = (typeof process !== 'undefined' && process.env?.MARKETPLACE_URL) || 
                  (typeof window !== 'undefined' && (window as any).MARKETPLACE_URL) ||
                  'http://localhost:3002';
  
  const apiKey = (typeof process !== 'undefined' && process.env?.MARKETPLACE_API_KEY) || 
                 (typeof window !== 'undefined' && (window as any).MARKETPLACE_API_KEY);
  
  const token = (typeof process !== 'undefined' && process.env?.MARKETPLACE_TOKEN) || 
                (typeof window !== 'undefined' && (window as any).MARKETPLACE_TOKEN);

  return new MarketplaceClient({
    baseUrl,
    apiKey,
    token,
    getUserId
  });
}

