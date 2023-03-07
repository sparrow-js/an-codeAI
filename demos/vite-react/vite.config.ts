import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import resolveExternalsPlugin from 'vite-plugin-resolve-externals'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "@locator/babel-jsx/dist",
            {
              env: "development",
            },
          ],
        ],
      },
    }),
    resolveExternalsPlugin({
      "@firefly/auto-engine": "AliLowCodeEngine",
    })
  ]
})
