import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// Mock Vercel API for local development
const vercelApiPlugin = () => ({
  name: "vercel-api",
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url?.startsWith("/api/")) {
        try {
          const apiPath = path.join(process.cwd(), req.url.split("?")[0] + ".ts");
          if (fs.existsSync(apiPath)) {
            const module = await server.ssrLoadModule(apiPath);
            
            // Collect body for POST requests
            if (req.method === "POST" || req.method === "PUT") {
              const chunks: any[] = [];
              req.on("data", (chunk: any) => chunks.push(chunk));
              req.on("end", async () => {
                const bodyStr = Buffer.concat(chunks).toString();
                try {
                  req.body = bodyStr ? JSON.parse(bodyStr) : {};
                } catch(e) {
                  req.body = bodyStr;
                }
                
                // Add simple Vercel response helpers
                res.status = (code: number) => { res.statusCode = code; return res; };
                res.json = (data: any) => {
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify(data));
                };
                
                await module.default(req, res);
              });
              return;
            } else {
              res.status = (code: number) => { res.statusCode = code; return res; };
              res.json = (data: any) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              };
              await module.default(req, res);
              return;
            }
          }
        } catch (e) {
          console.error("Local API Error:", e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal Server Error" }));
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), vercelApiPlugin()],
  define: {
    'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY || ''),
    'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: process.env.DISABLE_HMR === 'true' ? false : true,
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
