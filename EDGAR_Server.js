// EDGAR_Server 
// ========
// Start a server to return the results of the index database

//DECLARE RESOURCES
	const express = require('express')
	const app = express()
	const port = 3000
	const EDGAR_query = require('./query.js')
	const json_server = require('./json_server.js')
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
					const query = await axios.get('http://localhost:3001/data');
					res.json(query.data);
					
					//SQLITE METHOD
					// EDGAR_query.query_Autocomplete_Names(async function(data){
					// 	await res.json(data)
					// })	
					timetocomplete = Date.now()-starttime
					console.log('Autocomplete Done... took:'+timetocomplete+'ms')
				}catch(e){
					try{

					}catch(e){
						console.log('could not fetch page'+req.path);
						res.send('error');
					}		
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

//TEST SERVER, RETURN TEST PAGE FOR REMAINDER OF REQUESTS
	app.get('/*', async (req,res)=> {
		res.sendFile(__dirname +'/html/EDGAR_Index.html')
	})	

//LISTEN TO PORT WAIT FOR HTTP REQUEST
	app.listen(port, () => console.log(`EDGAR Fetch Server listening at http://localhost:${port}`))