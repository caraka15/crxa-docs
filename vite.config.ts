import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const serverLocationsDevProxy = (): PluginOption => ({
  name: "server-locations-dev-proxy",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/api/server-locations", async (req, res, next) => {
      try {
        const module = await import("./api/server-locations");
        if (typeof module.default === "function") {
          await module.default(req, res);
          return;
        }
      } catch (error) {
        console.error("Server locations handler error:", error);
        res.statusCode = 500;
        res.end("Server locations handler error");
        return;
      }

      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/_vercel/insights/script.js': {
        target: 'https://docs.crxanode.me',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), serverLocationsDevProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
