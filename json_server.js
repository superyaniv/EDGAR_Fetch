//json_server.js
//Fetch JSON stored results.

// GLOBAL REQUIRED
const jsonServer = require('json-server')
const server = jsonServer.create()
const path = require('path')
const router = jsonServer.router(path.join(__dirname, '/files/db/json/autocomplete_names.json'))
const middlewares = jsonServer.defaults()
const port = 3001


// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/', (req, res) => {
  res.jsonp(req.query.data)
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  // Continue to JSON Server router
  next()
})

// Use default router
server.use(router)
server.listen(port, () => {
  console.log(`JSON Server is running on port http://localhost:${port}`)
})
