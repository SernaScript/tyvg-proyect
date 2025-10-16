import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuración para optimizar el tamaño de las funciones serverless
  serverExternalPackages: ['playwright', 'playwright-core'],
  
  // Excluir dependencias pesadas del bundle de las funciones serverless
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir playwright del bundle de las funciones serverless
      config.externals = config.externals || [];
      config.externals.push({
        'playwright': 'commonjs playwright',
        'playwright-core': 'commonjs playwright-core',
        'chromium': 'commonjs chromium',
        'firefox': 'commonjs firefox',
        'webkit': 'commonjs webkit'
      });
      
      // Optimizar el cache de webpack
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        // Limitar el tamaño del cache
        maxMemoryGenerations: 1,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      };
    }
    return config;
  },
  
  // Configuración para reducir el tamaño del bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimizaciones adicionales
  compress: true,
};

export default nextConfig;
