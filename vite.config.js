import http from 'node:http'
import https from 'node:https'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const DEFAULT_BACKEND_URL = 'http://52.67.241.122:8080'

function dynamicBackendProxyPlugin() {
  const setupMiddleware = (server) => {
    server.middlewares.use((req, res, next) => {
      if (!req.url || !req.url.startsWith('/api/')) {
        return next()
      }

      const rawTarget = req.headers['x-kasper-backend-url'] || DEFAULT_BACKEND_URL
      let targetUrl
      try {
        targetUrl = new URL(req.url, String(rawTarget))
      } catch {
        targetUrl = new URL(req.url, DEFAULT_BACKEND_URL)
      }

      const client = targetUrl.protocol === 'https:' ? https : http
      const headers = { ...req.headers, host: targetUrl.host }
      delete headers['x-kasper-backend-url']

      const proxyReq = client.request(
        targetUrl,
        {
          method: req.method,
          headers,
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
          proxyRes.pipe(res, { end: true })
        }
      )

      proxyReq.on('error', () => {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            message:
              'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente em instantes.',
          })
        )
      })

      req.pipe(proxyReq, { end: true })
    })
  }

  return {
    name: 'kasper-dynamic-backend-proxy',
    configureServer: setupMiddleware,
    configurePreview: setupMiddleware,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dynamicBackendProxyPlugin()],
})

