//fetch_indexes.js
// ========
// Fetch all indexes from SEC database, unzip them.

// DECLARE THE REQUREMENT FILES 	
	const EDGAR_fetch = require('./fetch.js')
	const chalk = require('chalk');

// DECLARE ALL THE VARIABLES
	const EDGAR_archive_url = 'https://www.sec.gov/Archives/edgar/full-index/'
	const zipped_files_path = './files/zipped_indexes/'
	const unzipped_files_path = './files/unzipped_indexes/'
	
// DECLARE THE YEARS TO FETCH
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	let startyear = 1993; //1993 first year
	let endyear = 2020;
	let years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)


// GET ALL THE INDEXES //EXAMPLE getIndexes(years,quarters)
	async function getIndexes(years,quarters){
		//DECLARE VARS
		var urlstofetch = []
		const localpath = zipped_files_path;
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
