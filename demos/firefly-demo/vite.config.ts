import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import resolveExternalsPlugin from 'vite-plugin-resolve-externals';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  plugins: [
    react({}),
    resolveExternalsPlugin({
      '@firefly/auto-engine': 'AliLowCodeEngine',
    }),
  ],
});
