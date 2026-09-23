import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const devHealth: Plugin = {
  name: 'dev-health',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/health', (_req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ status: 'ok' }))
    })
  },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.PORT) || 5173

  return {
    plugins: [react(), devHealth],
    server: { port },
    preview: { port },
  }
})