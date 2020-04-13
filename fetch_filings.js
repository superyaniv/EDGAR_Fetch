	//fetch_filings.js
// ========
// Fetch the full SEC filing from teh database.

// DECLARE THE REQUREMENT FILES 	
	const EDGAR_fetch = require('./fetch.js')
	const EDGAR_query = require('./query.js')
	const chalk = require('chalk');

// DECLARE ALL THE VARIABLES
	const EDGAR_archive_url = 'https://www.sec.gov/Archives/edgar/full-index/'
	const EDGAR_base_url = 'https://www.sec.gov/Archives/'
	const filings_path = './files/filings/'
	const zipped_files_path = './files/zipped_indexes/'
	const unzipped_files_path = './files/unzipped_indexes/'
	const db_path = './files/db/'
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	
// DECLARE THE YEARS TO FETCH
	const startyear = 1993; //1993 first year
	const endyear = 2020;
	var years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)

//FUNCTION TO RETREIVE AND DOWNLOAD ALL FULL TEXT FILINGS DATE YYYY-MM-DD (2020-01-01 AND 2020-12-31)
	function retreive_CompanyFilings(start_date='2020-01-01',end_date='2020-12-31',CIK,limit=1000){
		//CALL QUERY
		EDGAR_query.query_CIK_Filings({'CIK': CIK,'start_date': start_date,'end_date': end_date,'limit': limit},async function(data){
			//MAP JUST THE COMPANY AND FILENAME
			var filing_items = Object.values(data).map(({Filename,Company_Name,Form_Type,Date_Filed})=>[Filename,Company_Name,Form_Type,Date_Filed])
			//TITLE SEARCH				
			console.log(chalk`\n${''.padEnd(30,'_')}\n\nGetting Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nCIK: {green ${CIK}}\nStart Date: {green ${start_date}}\nEnd Date: {green ${end_date}}\n${''.padEnd(30,'_')}\n\n`)
			var i =0
			for(const item of filing_items){
				i++
				//DECLARE CURRRENT INDEX
				 	const EDGAR_Path = item[0]
				 	const Company_Name = item[1];
				 	const Form_Type = item[2];
				 	const Date_Filed = item[3];
			 		const pcomplete = Math.round(i/filing_items.length*100)
			 	
			 	//REMOTE AND LOCAL PATH TO STORE FILES
			 		const remotepath = EDGAR_base_url+EDGAR_Path
			 		const localpath = filings_path+Company_Name+'/'+EDGAR_Path.split('/')[3]
					
			 	//RETREIVE DATAFILE LINKED
					results = await EDGAR_fetch.fetch_file(remotepath,localpath);

 				//LOG CURRENT OPERATION
							console.log(chalk`{inverse.bold ${String(pcomplete).padEnd(3,' ')}%} Company: {yellow ${Company_Name.padEnd(20,' ')} }Form: {cyan ${Form_Type.padEnd(10,' ')}}Date: {cyan ${Date_Filed.padEnd(11,' ')}}Status: {dim.italic ${String(results).padEnd(' ',20)}} Path: {dim.italic  ${EDGAR_Path}}`)

				//WAIT IN CASE
					await Delay(50)
			}
			//EDGAR_fetch.fetch_file(pathremote,'./files/filings');
		})
	}

//DELAY IF NEEDED...
	const Delay = (ms) => new Promise(r => setTimeout(r, ms));