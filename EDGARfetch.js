// EDGARfetch.js
// ========

// DECLARE THE REQUREMENT FILES 
	
	let EDGAR_fetch = require('./fetch.js')
	let EDGAR_store = require('./store.js')
	let EDGAR_query = require('./query.js')
	const chalk = require('chalk');

// DECLARE ALL THE VARIABLES

	const EDGAR_archive_url = 'https://www.sec.gov/Archives/edgar/full-index/'
	const EDGAR_base_url = 'https://www.sec.gov/Archives/'
	const filings_path = './files/filings/'
	const zipped_files_path = './files/zipped_indexes/'
	const unzipped_files_path = './files/unzipped_indexes/'
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	const startyear = 2020; //1993 first year
	const endyear = 2020;
	var years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)


// GET ALL THE INDEXES //EXAMPLE getIndexes(years,quarters)
	function getIndexes(years,quarters){

		years.forEach(year=>
			quarters.forEach(function(qtr){
				urltofetch = EDGAR_archive_url+year+'/'+qtr+'/master.gz';
				console.log('Fetching: '+urltofetch);
				
				idxfile = 'https://www.sec.gov/Archives/edgar/full-index/2020/QTR1/master.gz','./files/zipped_indexes/'+year+qtr+'.gz'
				EDGAR_fetch.fetch_file(idxfile);
			}
			)
		)
	}

// UNTAR ALL THE INDEXES //EXAMPLE unzip_Indexes(years,quarters)
	function unzip_Indexes(years,quarters){
		years.forEach(year=>
			quarters.forEach(function(qtr){
				var file_to_unzip = zipped_files_path+year+qtr+'.gz';
				console.log(chalk`{inverse.bold Unzipping:} {dim.italic ${file_to_unzip}}`)
				EDGAR_fetch.unzip_file(file_to_unzip,unzipped_files_path+year+qtr+'.idx');
			}
			)
		)
	}
	
// STORE ALL THE FILES //EXAMPLE store_Indexes(years,quarters)
	async function store_Indexes(years,quarters) {
			
		// SHOWING PROGRESS
			console.log(chalk`
					Getting Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}
					Starting Year: {green ${startyear}}
					Ending Year: {green ${endyear}}
					Years to Process: {green ${years}}`)
		// CREATE ARRAY OF FILES
			idxfile = []
			years.forEach(year=>
				quarters.forEach(function(qtr){
					idxfile.push(unzipped_files_path+year+qtr+'.idx')
				})
			)

		// ITERATE THROUGH FILESL BUT MAKE SURE SYNCRONOUS WITH AWAIT
			var i = 0
			for (const item of idxfile) {
				i++
				await EDGAR_store.store_idx_file(item)
				console.log(chalk`{inverse.bold ${Math.round(i/idxfile.length*100)}%} Storing: {dim.italic ${item}}`)
			}
		// FINISH
		  console.log(chalk`{inverse.bold Done!} {green ${idxfile.count} items processed.}`)
	}


var start_date = '2020-01-01'
var end_date = '2020-12-31'
var CIK = '814585.0'
getCompanyFilings(start_date,end_date,CIK)

//FUNCTION TO GET FILINGS - DATE YYYY-MM-DD (2020-01-01 AND 2020-12-31)
	function getCompanyFilings(start_date,end_date,CIK){
		EDGAR_query.queryCIK(start_date,end_date,CIK,async function(data){

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

//								console.log(results)
								
					//WAIT IN CASE
					await delay()
					

				}
			//EDGAR_fetch.fetch_file(pathremote,'./files/filings');
		})
	}


//DELAY IF NEEDED...
	function delay() {
	  return new Promise(resolve => setTimeout(resolve, 300));
	}

// QUERY THE DATBASE //EXAMPLE queryCIK('2020-01-01','2020-12-01','1000275.0',function(data){console.log(data)});
	function query_Indexes(start_date,end_date,CIK){
		EDGAR_query.queryCIK(CIK,function(data){
			//DECIDE WHAT O DO WITH THE RETURNED DATA
			console.log(data)
		})
	}
