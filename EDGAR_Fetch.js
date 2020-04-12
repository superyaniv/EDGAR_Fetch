// EDGAR_Fetch.js
// ========
// Fetch the SEC filing indexes and store them for search later.

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
	const db_path = './files/db/'
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	
// DECLARE THE YEARS TO FETCH
	const startyear = 1993; //1993 first year
	const endyear = 2020;
	var years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)

// GET ALL THE INDEXES //EXAMPLE getIndexes(years,quarters)
	async function getIndexes(years,quarters){
		//DECLARE VARS
		var urlstofetch = []
		var localpath = zipped_files_path;
		//CREATE URLFETCH ARRAY
		years.forEach(year=>
			quarters.forEach(function(qtr){
				urlstofetch.push(`${EDGAR_archive_url}/${year}/${qtr}/master.gz`)
			})
		)
		// SHOWING FUNCTION
		console.log(chalk`\n${''.padEnd(30,'_')}\n\nGetting Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nStart Year: {green ${startyear}}\nEnd Year: {green ${endyear}}\n${''.padEnd(30,'_')}\n\n`)
		var i =0
		//ITERATE ARRAY
		for(const urltofetch of urlstofetch){
			i++
			const pcomplete = Math.round(i/urlstofetch.length*100)
		 	//REMOTE AND LOCAL PATH TO STORE FILES
			 		const remotepath = urltofetch
			 		const localpath = zipped_files_path+urltofetch.split('/')[7]+'-'+urltofetch.split('/')[8]+'-'+urltofetch.split('/')[9]
			// SHOWING PROGRESS
				console.log(chalk`{inverse.bold ${String(pcomplete).padEnd(3,' ')}%} File: {yellow ${remotepath.padEnd(20,' ')} }Storing: {cyan ${localpath.padEnd(10,' ')}}`)
			
			// GET FILE
				results = await EDGAR_fetch.fetch_file(remotepath,localpath);
			//WAIT IN CASE
				await delay()
		}
	}


// UNZIP ALL THE INDEXES //EXAMPLE unzip_Indexes(years,quarters)
	async function unzipIndexes(years,quarters){
		
		// DECLARE VARS
			var filestounzip = []
			var i =0
		
		// SHOWING FUNCTION
			console.log(chalk`\n${''.padEnd(30,'_')}\n\nUnzipping Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nStart Year: {green ${startyear}}\nEnd Year: {green ${endyear}}\n${''.padEnd(30,'_')}\n\n`)
		
		// CREATE ARRAY
			years.forEach(year=>
				quarters.forEach(function(qtr){
					filestounzip.push(`${zipped_files_path}/${year}-${qtr}-master.gz`)
				})
			)
		
		// ITERATE ARRAY
			for(const filetounzip of filestounzip){
				i++
				const pcomplete = Math.round(i/filestounzip.length*100)
			 	// REMOTE AND LOCAL PATH TO STORE FILES
			 		const remotepath = filetounzip
			 		const localpath = unzipped_files_path+remotepath.slice(remotepath,-3).split('/')[4]+'.idx'
				// SHOWING PROGRESS
					console.log(chalk`{inverse.bold ${String(pcomplete).padEnd(3,' ')}%} File: {yellow ${remotepath.padEnd(20,' ')} }Unzipping: {cyan ${localpath.padEnd(10,' ')}}`)
				
				// UZNIP FILE
					results = await EDGAR_fetch.unzip_file(remotepath,localpath);
				// WAIT IN CASE
					await delay()
			}
	}


// STORE ALL THE FILES //EXAMPLE store_Indexes(years,quarters)
	async function store_Indexes(years,quarters) {

		//DECLARE VARS
			var idxfiles = []

		// SHOWING FUNCTION
			console.log(chalk`\n${''.padEnd(30,'_')}\n\nStoring Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nStart Year: {green ${startyear}}\nEnd Year: {green ${endyear}}\n${''.padEnd(30,'_')}\n\n`)

		//CREATE ARRAY
			years.forEach(year=>
				quarters.forEach(function(qtr){
					idxfiles.push(unzipped_files_path+year+'-'+qtr+'-master.idx')
				})
			)

		// ITERATE THROUGH FILES AND STORE IN DB WITH WAIT
			var i = 0
			for (const idxfile of idxfiles) {
				i++
				const pcomplete = Math.round(i/idxfiles.length*100)
				const localpath = db_path+'EDGAR_data.db'
				const remotepath = idxfile
				
				// STORE FILE IN DB
					results = await EDGAR_store.store_idx_file(remotepath)

				// SHOWING PROGRESS
					console.log(chalk`{inverse.bold ${String(pcomplete).padEnd(3,' ')}%} File: {yellow ${remotepath.padEnd(20,' ')} }Storing: {cyan ${localpath.padEnd(10,' ')}} Status: {dim.italic ${String(results).padEnd(' ',20)}}`)
					
				// WAIT IN CASE
					await delay()				
				
			}
		// FINISH
		  console.log(chalk`{inverse.bold Done!} {green ${idxfile.count} items processed.}`)
	}


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


//FUNCTION TO RETREIVE AND DOWNLOAD ALL FULL TEXT FILINGS DATE YYYY-MM-DD (2020-01-01 AND 2020-12-31)
	function retreive_CompanyFilings(start_date='2020-01-01',end_date='2020-12-31',CIK,limit=1000){

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