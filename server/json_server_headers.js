
	const fs = require('fs');
	const path = require('path')
//JSON SERVER INFO
	const jsonServer = require('json-server')
	const server = jsonServer.create()
	const middlewares = jsonServer.defaults()
	const port = 3002

//CREATE ONE OBJECT FROM ALL FILES.
	var db = {};
	var jsonfolder = path.join(__dirname, '../files/filings/10KHeaders/10KHeaders_json/')
	var files = fs.readdirSync(jsonfolder);
	files.forEach(function (file) {
		if (path.extname(jsonfolder + file) === '.json') {
			db[path.basename(jsonfolder + file.split(file.substring(file.indexOf('-')-10,file.indexOf('-')))[0].replace('edgardata',''), '.json')] = require(path.join(jsonfolder,file));
		}
	});
	const router = jsonServer.router(db)

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/', (req, res) => {
  res.jsonp(req.query)//[req.params.CIK]
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
  console.log(`JSON Server is running on ${port}`)
})
