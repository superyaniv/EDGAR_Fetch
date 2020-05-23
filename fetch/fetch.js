/* 
fetch.js
========
- Fetches files by idnex from EDGAR servers to store and process locally. 
- (Example) - simple - `node fetch/fetch` - (Example) - with memory heap limit higher - `node --max-old-space-size=8192 fetch/fetch`= - (Example) - with inspect memorgy and garbage collection - `node --max-old-space-size=8192 --expose-gc --inspect fetch/fetch`
 */

/* ----- FILE REQUIREMENTS  ----- */
const http = require('https')
const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper') // unzip (.zip)

/* ----- OPTION SETS FOR CURRENT SEC EDGAR DATA ----- */
// Fetch DERA Data. 
const options_dataset_add = {
	'filetype':'.zip',
	'filedir_from':'/Volumes/MacStore/EDGAR_Storage/datasets_add/raw/test1/',
	'startyear':2009,
	'endyear':2020,
	'quarters':['q1','q2','q3','q4'],
	'archive_url': 'https://www.sec.gov/files/dera/data/financial-statement-and-notes-data-sets',
	'filetypezip':['num.tsv','pre.tsv','tag.tsv','sub.tsv','dim.tsv','cal.tsv','ren.tsv'],
	'url_extender':'_notes'} //ignoring txt.tsv

/* -----MAIN DATASET CALL EXECUTION TO ITERATE THROUGH FOLDER AND OPTIONS----- */

fetch_edgar_files(options_dataset_add,(results)=>{console.log(results)})

/* -----CYCLE THROUGH SEC DATA FILES AND STORE/UNPACK THE ZIP / GZ FILE ----- */
async function fetch_edgar_files(options, callback){
	try{
		// Check Options for consistency.
		if (options.filedir_from.slice(-1)!='/'){throw Error(`Output directory not formed correctly: ${options.filedir_from}`)} //throw error if malformed directory
		if (!fs.existsSync(options.filedir_from)){fs.mkdirSync(options.filedir_from)} //create directory if none exists
		const currentyear = (new Date().getFullYear())
		if(typeof(options.startyear)!='number' || typeof(options.endyear)!='number'){throw new Error(`Year must be a declared number variable : ${options.startyear} = ${typeof(options.startyear)}`)}
		if(options.startyear<1993 || options.endyear>currentyear){throw new Error(`Year must be a between: 1993 and ${currentyear}`)}
		let years = Array.from(new Array(options.endyear-options.startyear+1), (x,i) => i + options.startyear)
		var urlstofetch = []
		// Create Map/Array of files to get.
		years.forEach(year=>
			options.quarters.forEach(function(qtr){
				if(year != currentyear || (options.quarters.indexOf(qtr)<Math.ceil((new Date().getMonth()+1)/3))){
					if(options.filetypezip===undefined){
						urlstofetch.push(`${options.archive_url}/${year}/${qtr}/${options.filetype}`)
					}else{
						urlstofetch.push(`${options.archive_url}/${year}${qtr}${(options.url_extender!=undefined)?options.url_extender:''}${options.filetype}`)
					}
				}
			})
		)
		callback(`${'-'.repeat(process.stdout.columns)}`);callback(`Getting Filings: EDGAR Search (Written by Yaniv Alfasy)`);callback(`Start Year: ${options.startyear}`,`End Year: ${options.endyear}`);callback(`${'-'.repeat(process.stdout.columns)}`)	
		/* ----- ITERATE THROUGH YEARS AND QTR REQUEST AND RETREIVE FILES ----- */
		for(i=0;i<urlstofetch.length;i++){
			const url = urlstofetch[i]
			let localfiletmp = options.filedir_from+url.split('/').slice(3).join('_')
			localfiletmp = localfiletmp.substr(0,localfiletmp.lastIndexOf('.'))
			const localfile = (options.filetypezip===undefined) ? localfiletmp+'.txt' : localfiletmp
			
			// Fetch and Download Results
			let results = {}
			results.fetch = await fetch_file({'url':url,'localfile':localfile,'filetypezip':options.filetypezip},results=>console.log(results))
			// Callback Results.
			callback({
				STATUS: ['PROCESSING', i+1, 'of', urlstofetch.length],
				PERCENT_COMPLETE: `${String('').padEnd(Math.round(((i+1)/urlstofetch.length)*(process.stdout.columns*.75)),'░')} ${Math.round(((i+1)/urlstofetch.length)*100)}%`,
				MEMORY_HEAP: [Math.round(process.memoryUsage().heapTotal/1024/1024),'MB'],
				FETCH: results.fetch
			})
			await Delay(50) // Wait in case pinging SEC servers more than 10x in 1 sec. Shouldn't be an issue with a syncronouse fetch.
		}
	}catch(err){
		throw err // Log (or throw) any errors
	}
}

// -------FETCH FILE USING REQUEST, AND STORE LOCALLY----------- // 
function fetch_file(options, callback) {
	// Ensure new Promise is returned.
	return new Promise(async function(resolve,reject){
		try{
			// Check if file already exists.
			const checkfile = `${path.dirname(options.localfile)}/${options.filetypezip[0].split('.')[0]}/${path.basename(options.localfile)}_${options.filetypezip[0]}`
			if(fs.existsSync(checkfile)){return resolve(`Skipping: File Exists: ${checkfile} | ${Math.round(fs.statSync(checkfile).size/1024/1024)} MB`)}				
			// Create Root Directory.
			if (!fs.existsSync(path.dirname(options.localfile))){fs.mkdirSync(path.dirname(options.localfile))}
			// Request File from SEC Website.
			http
				.get(options.url, function(response) {
					tmpfile = path.dirname(options.localfile)+'/tmp'+path.basename(options.localfile)+options.url.substr(options.url.lastIndexOf('.'))
					response.pipe(fs.createWriteStream(tmpfile))
					.on('finish',()=>{ 
						fs.createReadStream(tmpfile)
						.pipe(unzipper.Parse()) // Use unzip to read and pipe files from the zip container.
						.on('error',function(error){ 
							// console.log(error) - means no data within zip.
							fs.unlinkSync(tmpfile)
							return resolve(`Error No File to Unzip ${tmpfile}`)
						})
						.on('entry', function (entry) {
							if(options.filetypezip.includes(entry.path)){
								const localfile_unzipped = `${path.dirname(options.localfile)}/${entry.path.split('.')[0]}/${path.basename(options.localfile)}_${entry.path}`
								if (!fs.existsSync(path.dirname(localfile_unzipped))){fs.mkdirSync(path.dirname(localfile_unzipped))}
									entry.pipe(fs.createWriteStream(localfile_unzipped)) // Pipe Files
							} else {
								entry.autodrain()
							}
						})
						.on('finish',function(){
							// Delete temp file and callback results.
							fs.unlinkSync(tmpfile) 
							options.filetypezip.forEach(filename=>{
								localfile_unzipped = `${path.dirname(options.localfile)}/${filename.split('.')[0]}/${path.basename(options.localfile)}_${filename}`
								if(fs.existsSync(localfile_unzipped)){
									callback({Status:`File successfully created: ${localfile_unzipped}`,Filesize:[Math.round(fs.statSync(localfile_unzipped).size/1024/1024),'MB']})			
								}else{
									callback({Status:`Error Creating File`})
								}
							})
							return resolve('STATUS OK') // Return Promise.
						})
					})
			})
		}catch(err){
			console.log(`ERROR: ${error}`) // Throw Error
		}
	})
}
/* ----- DELAY FUNCTION IF NEEDED ----- */
const Delay = (ms) => new Promise(r => setTimeout(r, ms))
