//json_server_datasets.js
//serve up queries for datasets

//REQUIREMENTS
	const path = require('path')
	const chalk = require('chalk')
	const fs = require("fs")
//JSON SERVER INFO
	const jsonServer = require('json-server')
	const server = jsonServer.create()
	const middlewares = jsonServer.defaults()
	const port = 3004	
	var jsonfolder = path.join(__dirname, '../files/datasets/json/json_companies')
//CREATE ONE OBJECT FROM ALL FILES.
	const files = fs.readdirSync(jsonfolder,{withFileTypes: true}).slice(10)
		.filter(dirent => dirent.isFile())
		.filter(dirent=>(dirent.name.split('.')[1]=='json'))
		.map(dirent => dirent.name)
	let db={}
	let i=0
	files.forEach(file=>{
		//STATUS CONSTANTS
		const pcomplete=Math.round((i+1)/(files.length)*100)
		const conosolecoluns_offset = (String(pcomplete).length+4)
		const consolecolumns = (process.stdout.columns-conosolecoluns_offset)
		const paddingprogress = Math.round(pcomplete/100*consolecolumns)
		const paddingtogo = consolecolumns-paddingprogress
		//SHOW STATUS
		cstatus = chalk`{white CREATING DATABASE JSON_DATASETS [${i} of ${files.length}]}`
		console.log(chalk`\n{cyan.bold ${cstatus.padStart(process.stdout.columns/2+10,'-').padEnd(process.stdout.columns,'-')}}`)
		console.log(chalk`{white ${String('[').padEnd(paddingprogress,'░')} ${pcomplete}%${String(']').padStart(paddingtogo,' ')}\n}`)
		//MAIN REQUIRE STATEMENT
		db[file.split('.')[0]]=require(path.join(jsonfolder,file))
		i++
	 })
	const router = jsonServer.router(db)

// DEFAULT MIDDLEWARE
	server.use(middlewares)

//POST PUT AND PATCH USE BODY PARSER
	server.use(jsonServer.bodyParser)
	server.use((req, res, next) => {
		if (req.method === 'POST') {
			req.body.createdAt = Date.now()
		}
  		//CONTINUE TO JSON ROUTER
  		next()
	})

// WRAP IN DATA PROPERTY
	router.render = (req, res) => {
		// var requiredKeys = 
		// ["adsh",
		// "tag",
		// "version",
		// "coreg",
		// "ddate",
		// "qtrs",
		// "uom",
		// "value",
		// "footnote",
		// "report",
		// "line",
		// "stmt",
		// "inpth",
		// "rfile",
		// "plabel",
		// "negating"]
		// obj = res.locals.data
		// dobj = obj.map(function(k){
		// 	let tmpObj = {}
		// 	requiredKeys.forEach(x=>{
		// 		if(k[x]===undefined){
		// 			tmpObj[x]=''}
		// 		else{
		// 			tmpObj[x]=k[x]}
		// 		return tmpObj[x]
		// 	})
		// 	return tmpObj
		// })
		res.jsonp({data:res.locals.data})
		
	}	
// Use default router
	server.use(router)
	server.listen(port, () => {
		console.log(`JSON Server is running on ${port})`)
	})
