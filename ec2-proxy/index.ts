import express, { Request, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { getEnv } from './functions'

const app = express()
const port = 8080
const endpoint = getEnv('ENDPOINT')
// const endpoint = 'http://localhost:5432'

app.use(express.json({ limit: '100mb' }))


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  console.log('Headers:', req.headers)
  next()
})

app.use(
  '/',
  createProxyMiddleware<Request, Response>({
    target: endpoint,
    changeOrigin: false,
    selfHandleResponse: false,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization)
        }
      },
    },
  }),
)

app.listen(port, () => {
  console.log(`Server V4 started on ${port}`)
})
