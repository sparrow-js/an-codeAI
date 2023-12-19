import path from "path";
import { defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const buildMode = command === "build" ? "production" : "development";

  return defineConfig({
    base: "",
    plugins: [
      react(),
      checker({ typescript: true }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(buildMode),
      'process.env.IS_PREACT': 'false'
    }
  });
};
