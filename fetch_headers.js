//fetch_headers.js
// DECLARE THE REQUREMENT FILES 	
	const EDGAR_fetch = require('./fetch.js')
	const EDGAR_query = require('./query.js')
	const chalk = require('chalk');

// DECLARE ALL THE VARIABLES
	const filings_path = './files/filings/'

//FUNCTION TO RETREIVE AND DOWNLOAD ALL 10K HEADERS FOR RECENT FILERS (LAST 1.5 YEARS) //EXAMPLE retreive_CompanyHeaders_10K();
	async function retreive_CompanyHeaders_10K(){
		//CREATE VIEW IF IT IS NOT ALREADY CREATED
		//Log Function: Gets filers over the last 1.5 years that filed a 10K
 		console.log(chalk`\n${''.padEnd(30,'_')}\n\nGetting Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nOperation: {green Storing Headers}\nFilings: {green 10-K}\nTime Span: {green 1.5 Yrs}\n${''.padEnd(30,'_')}\n\n`)

		EDGAR_query.query_TopRecentFilers(async function(data){
				
				var filing_items = Object.values(data).map(({Company_Name,CIK,Form_Type,Date_Filed,Filename})=>[Company_Name,CIK,Form_Type,Date_Filed,Filename])
				console.log(filing_items)
				//console.log(filing_items)
				
			
				for(var i = 0; i < filing_items.length; i++){
					filing = filing_items[i]
					//DECLARE CURRRENT INDEX
					 	 const Company_Name = filing[0];
					 	 const CIK = filing[1]
					 	 const Form_Type = filing[2];
					 	 const Date_Filed = filing[3];
					 	 const EDGAR_Path = filing[4];
				 		 const pcomplete = Math.round(i/filing_items.length*100)

					//DETERMINE THE HEADERURL USING THE FILENAME
						var URL_Head=`https://www.sec.gov/Archives/`
						var URL_Adder=`${EDGAR_Path.split('.')[0].replace(/-/gi,'')}`
						var URL_Tail=`/${EDGAR_Path.split('/')[3].split('.')[0]}-index-headers.html`
						var headerURL=URL_Head+URL_Adder+URL_Tail
					
					//DECLARE REMOTE AND LOCAL PATH TO STORE FILES
						var remotepath= headerURL
						var localpath=filings_path+'10KHeaders/'+(URL_Adder+URL_Tail).replace(/\//gi,'')
					//LOG PROGRESS
		  				var results = await EDGAR_fetch.fetch_file(remotepath,localpath);
		  				await Delay(Math.floor(Math.random() * (1000)*1) + 1000)
		  			console.log(chalk`
					{inverse.bold ${String(pcomplete)}%} {dim ${i} of ${filing_items.length}} 
					Company: {yellow ${Company_Name}} Form: {cyan ${Form_Type}} Date: {cyan ${Date_Filed}} 
					Status: {dim.italic ${results}} 
					Remotepath: {dim.italic  ${remotepath}}
					Localpath: {dim.italic  ${localpath}}`)
				//WAIT IN CASE

			}
		})
	}
//DELAY IF NEEDED...
	const Delay = (ms) => new Promise(r => setTimeout(r, ms));