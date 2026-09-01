import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import packageJson from "./package.json";

export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.DEPLOY_TARGET === 'gh-pages' || 
                        process.env.GITHUB_ACTIONS === 'true' || 
                        process.env.BUILD_TARGET === 'gh-pages';
  const base = process.env.BASE_URL || (isGitHubPages ? '/Golden-Road-Safety/' : '/');

  return {
    base,
    build: {
      outDir: 'dist',
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY || ''),
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || ''),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
      dedupe: ["react", "react-dom"],
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
