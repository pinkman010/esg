import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const root = path.resolve('dist')
const port = Number(process.env.PORT ?? 4173)

const mime = {
  '.css': 'text/css;charset=utf-8',
  '.html': 'text/html;charset=utf-8',
  '.js': 'text/javascript;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url ?? '/').split('?')[0])
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath
  const filePath = path.join(root, normalizedPath)

  if (!filePath.startsWith(root)) {
    response.writeHead(403)
    response.end('forbidden')
    return
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, 'index.html'), (fallbackError, fallbackData) => {
        if (fallbackError) {
          response.writeHead(404)
          response.end('not found')
          return
        }

        response.writeHead(200, { 'Content-Type': mime['.html'] })
        response.end(fallbackData)
      })
      return
    }

    response.writeHead(200, {
      'Content-Type': mime[path.extname(filePath)] ?? 'application/octet-stream',
    })
    response.end(data)
  })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Static preview available at http://127.0.0.1:${port}/`)
})
