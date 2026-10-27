import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
      },
      plugins: [react()],
      define: {
        'process.env.DISCORD_CLIENT_ID': JSON.stringify(env.DISCORD_CLIENT_ID || env.VITE_DISCORD_CLIENT_ID || ''),
      },
      build: {
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1600,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react-router') || id.includes('react-helmet-async')) {
                  return 'vendor-router';
                }
                if (id.includes('firebase')) {
                  return 'vendor-firebase';
                }
                if (id.includes('framer-motion')) {
                  return 'vendor-framer';
                }
                if (id.includes('lucide-react') || id.includes('react-icons')) {
                  return 'vendor-icons';
                }
              }
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        dedupe: ['react', 'react-dom']
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-dom/client',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          'framer-motion',
          'lucide-react',
          'react-icons/fa',
          'react-icons/go',
          'react-icons/si',
          'react-icons/tb'
        ]
      }
    };
});
