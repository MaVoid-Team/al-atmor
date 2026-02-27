declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    cleanOnDelete?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    reloadOnOnline?: boolean;
    sourcemap?: boolean;
    buildExcludes?: (string | RegExp)[];
    publicExcludes?: (string | RegExp)[];
    manifestTransforms?: Array<(manifestEntries: any[]) => any>;
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: string;
      options?: {
        cacheName?: string;
        expiration?: {
          maxAgeSeconds?: number;
          maxEntries?: number;
        };
        networkTimeoutSeconds?: number;
      };
    }>;
  }

  export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
