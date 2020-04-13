// store_indexes.js
// ========
// Store all the index files.

// DECLARE ALL THE VARIABLES
	const unzipped_files_path = './files/unzipped_indexes/'
	const db_path = './files/db/'
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	
// DECLARE THE YEARS TO FETCH
	const startyear = 1993; //1993 first year
	const endyear = 2020;
	var years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)

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
					await Delay(50)				
			}
		// FINISH
		  console.log(chalk`{inverse.bold Done!} {green ${idxfile.count} items processed.}`)
	}
//DELAY IF NEEDED...
	const Delay = (ms) => new Promise(r => setTimeout(r, ms));