import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,          // allow LAN + ngrok
    port: 8080,
    allowedHosts: [
      "localhost",
      ".ngrok-free.app"  // 👈 allow ALL ngrok URLs
    ],
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ["three", "@google/model-viewer"],
  },

  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
}));
