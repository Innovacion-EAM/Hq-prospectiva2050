import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";

const devHealth: Plugin = {
  name: "dev-health",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/health", (_req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ status: "ok" }));
    });
  },
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 4173;

  return {
    plugins: [react(), tailwindcss(), devHealth],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    base: mode === "dev" ? "/" : "/repo/",
    server: { port },
    preview: { port },
  };
});