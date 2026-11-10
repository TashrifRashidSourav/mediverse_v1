import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            // Vendor chunks cache independently of app code across deploys.
            manualChunks(id: string) {
              if (!id.includes('node_modules')) return undefined;
              // Storage is lazy-loaded (see firebase.ts getStorage), keep it out of the shared chunk.
              if (id.includes('/@firebase/storage') || id.includes('/firebase/storage') || id.includes('/firebase/compat/storage')) return undefined;
              if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'vendor-firebase';
              if (id.includes('/react-router') || id.includes('/@remix-run/')) return 'vendor-router';
              if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) return 'vendor-react';
              return undefined;
            },
          },
        },
      },
      // Used by the hospital-site chat widget (AI replies). NOTE: this value is
      // embedded in the client bundle; move to a server-side proxy for production.
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
