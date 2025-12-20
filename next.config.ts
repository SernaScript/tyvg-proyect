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
      
      // Configuración específica para Vercel
      if (process.env.VERCEL) {
        // Optimizaciones adicionales para Vercel
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              playwright: {
                test: /[\\/]node_modules[\\/](playwright|playwright-core)[\\/]/,
                name: 'playwright',
                chunks: 'all',
                priority: 10,
                reuseExistingChunk: true,
              },
            },
          },
        };
      }
    } else {
      // Excluir módulos de Node.js del bundle del cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      
      // Excluir pg y adaptadores de Prisma del bundle del cliente
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'pg': 'commonjs pg',
          '@prisma/adapter-pg': 'commonjs @prisma/adapter-pg',
          '@prisma/client': 'commonjs @prisma/client',
        });
      } else {
        config.externals = [
          config.externals,
          {
            'pg': 'commonjs pg',
            '@prisma/adapter-pg': 'commonjs @prisma/adapter-pg',
            '@prisma/client': 'commonjs @prisma/client',
          }
        ];
      }
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
