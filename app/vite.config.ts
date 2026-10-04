import path from "path"
import { realpathSync } from "node:fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, searchForWorkspaceRoot } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Lighting is imported by the lazy experimental map, after the initial crawl.
    include: ["@deck.gl/core"],
  },
  server: {
    fs: {
      // Linked worktree/runtime packages can serve font assets from this exact path.
      allow: [searchForWorkspaceRoot(__dirname), realpathSync(path.resolve(__dirname, "node_modules"))],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
