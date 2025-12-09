export interface MCPServer {
  id: string;
  name: string;
  type?: 'local' | 'external-api';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  connected: boolean;
  // External API specific
  endpoint?: string;
  transport?: 'sse' | 'http';
  authType?: 'bearer' | 'api-key' | 'none';
  authHeader?: string;
  authConfigKey?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  serverId: string;
  inputSchema: Record<string, any>;
}

export interface MCPApp {
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
  relevance?: number; // For tool suggestions
  visibility?: 'private' | 'global';
  userId?: string; // For private apps, store the owner's user ID
  // External API specific
  endpoint?: string;
  transport?: 'sse' | 'http';
  authType?: 'bearer' | 'api-key' | 'none';
  authHeader?: string;
  authConfigKey?: string;
}

export interface ToolUsage {
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







