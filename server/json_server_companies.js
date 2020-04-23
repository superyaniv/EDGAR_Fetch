//json_server_companies.js
//serve up queries for company filings.

//REQUIREMENTS
	const fs = require('fs');
	const path = require('path')
	const _ = require('lodash')
	const chalk = require('chalk')

//JSON SERVER INFO
	const jsonServer = require('json-server')
	const server = jsonServer.create()
	const middlewares = jsonServer.defaults()
	const port = 3003	

//IF NEEDED
	const currentyear = (new Date().getFullYear())
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	const currentquarter = (Math.ceil((new Date().getMonth()+1)/3))
	
//CREATE ONE OBJECT FROM ALL FILES.
	var db={}
	var jsonfolder = path.join(__dirname, '../files/indexes/json/json_companies')
	const files = fs.readdirSync(jsonfolder,{withFileTypes: true})
					.filter(dirent => dirent.isFile())
					.filter(dirent=>(dirent.name.split('.')[1]=='json'))
					.map(dirent => dirent.name)
	i=0
	files.forEach(function (file){
	//STATUS CONSTANTS
			const pcomplete=Math.round((i+1)/(files.length)*100)
			const conosolecoluns_offset = (String(pcomplete).length+4)
			const consolecolumns = (process.stdout.columns-conosolecoluns_offset)
			const paddingprogress = Math.round(pcomplete/100*consolecolumns)
			const paddingtogo = consolecolumns-paddingprogress
			//SHOW STATUS
			cstatus = chalk`{white CREATING DATABASE [${i} of ${files.length}]}`
			console.log(chalk`\n{cyan.bold ${cstatus.padStart(process.stdout.columns/2+10,'-').padEnd(process.stdout.columns,'-')}}`)
			console.log(chalk`{white ${String('[').padEnd(paddingprogress,'░')} ${pcomplete}%${String(']').padStart(paddingtogo,' ')}\n}`)
			
			console.log(file)
			CIK = file.split('.')[0]
			console.log(CIK)
			console.log(file)
			db[CIK]=require(path.join(jsonfolder,file))
			i++
	 })



const router = jsonServer.router(db)

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/', (req, res) => {
	res.jsonp(req.query)//[req.params.CIK]

	//http://localhost:3003/103379/?_&Date_Filed_gte=2018-01-01&Date_Filed_lte=2020-01-01&Form_Type=10-K&_sort=Date_Filed&_order=asc
})

//POST PUT AND PATCH USE BODY PARSER
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  // CONTINUE TO JSON ROUTER
  next()
})

// Use default router
server.use(router)
server.listen(port, () => {
  console.log(`JSON Server is running on ${port}`)
})
