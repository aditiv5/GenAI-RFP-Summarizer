import react from '@vitejs/plugin-react';
//import viteBasicSslPlugin from '@vitejs/plugin-basic-ssl';

import path from 'path';

import { defineConfig } from 'vite';

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    //viteBasicSslPlugin()
  ],

  server: {
    watch: {
      usePolling: true,
    },
    //  https: true,

    port: 3000,

    open: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      './runtimeConfig': './runtimeConfig.browser',
    },
  },
});
