// EDGAR_Server 
// ========
// Start a server to return the results of the index database

//DECLARE RESOURCES
	const express = require('express')
	const app = express()
	const port = 3000
	let EDGAR_query = require('./query.js')

//VARIABLE DEFAULTS
	var start_date = '2020-01-01'
	var end_date = '2020-12-31'
	var CIK = '814585.0'
	var limit = 1000
	var Form_Type = '10-K'

//GET FILINGS AND CIK (CENTRAL INDEX KEY) FOR AUTOCOMPOLETE
	app.get('/EDGAR/queryAutoComplete', async (req,res)=> {

		//QUERY TOP FILERS OVER THE LAST 2 YEARS
			EDGAR_query.query_TopRecentFilers(async function(data){
		
			//RETURN JSON
				res.json(data)
		})	
	})

//GET FILINGS AND FILING INFORMATION FROM INDEX DATABASE
	app.get('/EDGAR/Company_Filings/:CIK/:startdate/:enddate', (req,res,next)=> {
 		//LIMIT AMOUNT RETURNED 
 		options={'CIK': req.params.CIK,
					'start_date': req.params.startdate,
					'end_date': req.params.enddate,
					'limit': limit}
		limit = 1000
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
	app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))