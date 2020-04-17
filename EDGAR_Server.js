// EDGAR_Server 
// ========
// Start a server to return the results of the index database

//DECLARE RESOURCES
	const express = require('express')
	const app = express()
	const port = 3000
	const EDGAR_query = require('./query/query.js')
	const json_server_autocomplete = require('./server/json_server_autocomplete.js')
	const json_server_headers = require('./server/json_server_headers.js')
	const axios = require('axios');

//VARIABLE DEFAULTS
	var start_date = '2020-01-01'
	var end_date = '2020-12-31'
	var CIK = '814585.0'
	var limit = 1000
	var Form_Type = '10-K'

//GET FILINGS AND CIK (CENTRAL INDEX KEY) FOR AUTOCOMPOLETE
	app.get('/EDGAR/queryAutoComplete', async (req,res)=> {
		//QUERY TOP FILERS OVER THE LAST 2 YEARS
		let starttime = Date.now()
		console.log('Querying Autocomplete... ')
		timetocomplete = Date.now()-starttime
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
		CIK=req.params.CIK
		header_item=req.params.header_item
		//QUERY TOP FILERS OVER THE LAST 2 YEARS
			let starttime = Date.now()
			console.log('Querying Headers... ')
			timetocomplete = Date.now()-starttime
				try{

					//JSON-SERVER METHOD
					console.log(`http://localhost:3002/${CIK}`)
					const query = await axios.get(`http://localhost:3002/${CIK}`);
					res.json(query.data);
				
					timetocomplete = Date.now()-starttime
					console.log('Query Done... took:'+timetocomplete+'ms')
				}catch(e){
					console.log('could not fetch page '+req.path);
					res.send('error');
				}
	})


//GET FILINGS AND FILING INFORMATION FROM INDEX DATABASE
	app.get('/EDGAR/Company_Filings/:CIK/:startdate/:enddate', (req,res,next)=> {

 		//SET OPTIONS BUT LIMIT AMOUNT RETURNED 
 		options={'CIK': req.params.CIK,
					'start_date': req.params.startdate,
					'end_date': req.params.enddate,
					'limit': 1000}

		setTimeout(function(){
			try{
				//QUERY ALL FILINGS IN INDEX (LIMIT 1000)
				EDGAR_query.query_CIK_Filings(options, async function(data){
					//RETURN THE COMPANIES AND FILING DATA
					res.json(data)
				})
			}catch(err){
				 next(err)
			}
		},1000)
	})
//TEST HEADER PAGE
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