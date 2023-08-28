import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import resolveExternalsPlugin from 'vite-plugin-resolve-externals';
import { resolve } from 'path';
import markjsx from './vite-plugin-react-markjsx';


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
  plugins: [
    {
      ...markjsx(),
      enforce: 'pre',
    },
    react(
    // {
    //   babel: {
    //     plugins: [
    //       [
    //         'firefly-babel-jsx/dist',
    //         {
    //           env: 'development',
    //         },
    //       ],
    //     ],
    //   },
    // }
    ),
    resolveExternalsPlugin({
      '@firefly/auto-engine': 'AliLowCodeEngine',
    }),
  ],
});
