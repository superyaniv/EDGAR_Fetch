// EDGAR_Server 
// ========
// Start a server to return the results of the index database

//DECLARE RESOURCES
	const express = require('express')
	const app = express()
	const json_server_autocomplete = require('./server/json_server_autocomplete.js')
	const json_server_headers = require('./server/json_server_headers.js')
	const json_server_companies = require('./server/json_server_companies.js')
	const axios = require('axios');
	app.set('json spaces', 2)
	const port = 3000

//GET FILINGS AND CIK (CENTRAL INDEX KEY) FOR AUTOCOMPOLETE
	app.get('/EDGAR/queryAutoComplete', async (req,res)=> {
		//QUERY TOP FILERS OVER THE LAST 2 YEARS
		let starttime = Date.now()
		console.log('Querying Autocomplete... ')
		
			try{
				//JSON-SERVER METHOD
				//const cv = await EDGAR_query.create_View()
				const query = await axios.get('http://localhost:3001/data');
				res.json(query.data)
				
				timetocomplete = Date.now()-starttime
				console.log('Autocomplete Done... took:'+timetocomplete+'ms')
			}catch(e){
				console.log('could not fetch page '+req.path);
				res.send('error');
			}
	})

//GET HEADER FILES
	app.get('/EDGAR/queryHeaders/:CIK', async (req,res)=> {
		const CIK=req.params.CIK
		const header_item=req.params.header_item
		//QUERY TOP FILERS OVER THE LAST 2 YEARS
			let starttime = Date.now()
			console.log('Querying Headers... ')
				try{
					//JSON-SERVER METHOD
					console.log(`http://localhost:3002/${CIK}`)
					const query = await axios.get(`http://localhost:3002/${CIK}`);
					res.json(query.data);
				
					timetocomplete = Date.now()-starttime
					console.log('Query Done... took:'+timetocomplete+'ms')
				}catch(e){
					console.log('could not fetch page '+req.path)
					res.send('error')
				}
	})
//TEST GET FILINGS FROM JSON_SERVER
	app.get('/EDGAR/Company_Filings/:CIK/', async (req,res,next)=> {
	try{
 		//SET OPTIONS BUT LIMIT AMOUNT RETURNED 
 		q = []
 		let CIK=req.params.CIK
		let querystring = Object.entries(req.query).map((k)=>{return k[0]+'='+k[1]}).join('&')
 		console.log(querystring)
 		//QUERY JSON CIK
			let starttime = Date.now()
			console.log('Querying filings... ')
			timetocomplete = Date.now()-starttime

					//JSON-SERVER METHOD
					console.log(`http://localhost:3003/${CIK}/?${querystring}`)
					const query = await axios.get(`http://localhost:3003/${CIK}/?${querystring}`);
					res.json(query.data);
					console.log(query)
					timetocomplete = Date.now()-starttime
					console.log('Query Done... took:'+timetocomplete+'ms')
		}catch(e){
			throw e
					console.log('could not fetch page '+req.path);
					res.send('error');
		}
	})
//HEADER PAGE
	app.get('/headers', async (req,res)=> {
		res.sendFile(__dirname +'/html/EDGAR_Headers.html')
	})	
//
	app.get('/headers/:CIK', async (req,res)=> {
		var CIK=req.params.CIK
		res.sendFile(__dirname +'/html/EDGAR_Headers.html')
	})	
//TEST SERVER, RETURN TEST PAGE FOR REMAINDER OF REQUESTS
	app.get('/', async (req,res)=> {
		res.sendFile(__dirname +'/html/EDGAR_Index.html')
	})	

//LISTEN TO PORT WAIT FOR HTTP REQUEST
	app.listen(port, () => console.log(`EDGAR Fetch Server listening at http://localhost:${port}`))