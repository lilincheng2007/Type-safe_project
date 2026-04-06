import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { initDeliveryStore } from './store/deliveryStore.js'
import { authRoutes } from './routes/auth.js'
import { deliveryRoutes } from './routes/delivery.js'

initDeliveryStore()

const app = new Hono()

/** 浏览器若打开 http://localhost:8787/ 会看到说明（本站为 API，无网页） */
app.get('/', (c) =>
  c.json({
    service: 'delivery-backend',
    hint: '这是外卖演示的 API 服务，网页请用 Vite 开发服务器打开，例如 http://localhost:5173',
    try: ['/api/health', '/api/auth/login (POST)'],
  }),
)

app.get('/api/health', (c) => c.json({ ok: true }))

const api = new Hono()
api.route('/auth', authRoutes)
api.route('/', deliveryRoutes)

app.route('/api', api)

const port = Number(process.env.PORT ?? 8787)

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`delivery-backend listening on http://localhost:${info.port}`)
  },
)
