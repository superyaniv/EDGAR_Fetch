// EDGAR_Server 
// ========
// Start a server to return the results of the index database

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
	app.get('/EDGAR/Company_NamesandCIK', async (req,res)=> {
		var start_date = '2019-01-01'
		var end_date = '2020-12-31'
		var limit = 10000

		EDGAR_query.queryNamesCIK(start_date,end_date,Form_Type,limit,async function(data){
			
			//MAP JUST THE COMPANY AND CIK FOR USE IN AUTO COMPLETE
				res.json(data)
		})	
	})

//GET FILINGS AND FILING INFORMATION FROM INDEX DATABASE
	app.get('/EDGAR/Company_Filings/:CIK/:startdate/:enddate', async (req,res)=> {
		CIK = req.params.CIK
		start_date = req.params.startdate;
		end_date = req.params.enddate;
		limit = 1000
		
		EDGAR_query.queryCIK(start_date,end_date,CIK,limit,async function(data){
			
			//RETURN THE COMPANIES AND FILING DATA
				res.json(data)
		})
		
	})

//TEST SERVER
	app.get('/*', async (req,res)=> {
				res.sendFile(__dirname +'/html/EDGAR_Index.html')
		})	

//LISTEN TO PORT WAIT FOR HTTP REQUEST
	app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))