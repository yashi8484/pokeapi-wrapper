import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";

export default defineConfig({
  server: {
    port: 2424,
  },
  plugins: [
    ...VitePluginNode({
      adapter: "fastify",
      appPath: "./src/index.ts",
      exportName: "app",
    }),
  ],
});
