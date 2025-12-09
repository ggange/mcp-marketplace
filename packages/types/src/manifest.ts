export interface AppManifestLocal {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  requiresConfig?: string[];
}

export interface AppManifestExternalApi {
  endpoint: string;
  transport: 'sse' | 'http';
  auth: {
    type: 'bearer' | 'api-key' | 'none';
    header?: string;
    configKey?: string;
  };
}

export interface AppManifest {
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







