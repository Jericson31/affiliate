import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Check if the request is for a file that doesn't exist and doesn't have an extension
        if (req.url && !req.url.includes('.') && !req.url.startsWith('/api') && !req.url.startsWith('/auth/v1')) {
          const filePath = path.join(process.cwd(), 'dist', req.url);
          if (!fs.existsSync(filePath)) {
            req.url = '/';
          }
        }
        next();
      });
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
