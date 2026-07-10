const fs = require('node:fs')
const http = require('node:http')
const https = require('node:https')
const path = require('node:path')

const listenHost = process.env.SVS_PROXY_HOST || '0.0.0.0'
const listenPort = Number(process.env.SVS_PROXY_PORT || 8443)
const targetHost = process.env.SVS_TARGET_HOST || '127.0.0.1'
const targetPort = Number(process.env.SVS_TARGET_PORT || 5173)
const pfxPath = process.env.SVS_PROXY_PFX || path.resolve(__dirname, '..', '.cert', 'svs-proxy.pfx')
const passphrase = process.env.SVS_PROXY_PFX_PASSWORD || 'svs-local-proxy'

if (!fs.existsSync(pfxPath)) {
  console.error(`Missing HTTPS certificate: ${pfxPath}`)
  console.error('Generate it first, then run npm run proxy:https again.')
  process.exit(1)
}

const server = https.createServer(
  {
    pfx: fs.readFileSync(pfxPath),
    passphrase
  },
  (req, res) => {
    const proxyReq = http.request(
      {
        hostname: targetHost,
        port: targetPort,
        method: req.method,
        path: req.url,
        headers: {
          ...req.headers,
          host: `${targetHost}:${targetPort}`,
          'x-forwarded-host': req.headers.host,
          'x-forwarded-proto': 'https'
        }
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
        proxyRes.pipe(res)
      }
    )

    proxyReq.on('error', (error) => {
      res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(`Reverse proxy target unavailable: ${error.message}`)
    })

    req.pipe(proxyReq)
  }
)

server.on('upgrade', (req, socket, head) => {
  const proxyReq = http.request({
    hostname: targetHost,
    port: targetPort,
    method: req.method,
    path: req.url,
    headers: {
      ...req.headers,
      host: `${targetHost}:${targetPort}`,
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': 'https'
    }
  })

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(
      [
        'HTTP/1.1 101 Switching Protocols',
        ...Object.entries(proxyRes.headers).map(([key, value]) => `${key}: ${value}`),
        '',
        ''
      ].join('\r\n')
    )
    proxySocket.pipe(socket)
    socket.pipe(proxySocket)
    if (proxyHead.length) socket.write(proxyHead)
  })

  proxyReq.on('error', () => socket.destroy())
  proxyReq.end()
  if (head.length) proxyReq.write(head)
})

server.listen(listenPort, listenHost, () => {
  console.log(`HTTPS reverse proxy: https://192.168.18.12:${listenPort}/svs/`)
  console.log(`Target: http://${targetHost}:${targetPort}/svs/`)
})
