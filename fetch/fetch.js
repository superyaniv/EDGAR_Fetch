/* 
fetch.js
========
- Fetches files by idnex from EDGAR servers to store and process locally. 
- (Example) - simple - `node fetch/fetch`
- (Example) - with memory heap limit higher - `node --max-old-space-size=8192 fetch/fetch`
- (Example) - with inspect memorgy and garbage collection - `node --max-old-space-size=8192 --expose-gc --inspect fetch/fetch`
 */

/* ----- FILE REQUIREMENTS  ----- */
	const http = require('https')
	const fs = require('fs')
	const path = require('path')
	const chalk = require('chalk')
	const zlib = require('zlib') // gunzip requirement (.gz)
	const unzipper = require('unzipper') // unzip (.zip)
	const quarters = ['QTR1','QTR2','QTR3','QTR4'] // quarter formats for some pulls
	const quarters_short = ['q1','q2','q3','q4'] // quarter formats for some pulls
	const filesizetypes = ['Bytes','KB','MB','GB'] 
	var total_written = 0
	const starttime = new Date()
/* ----- OPTION SETS FOR CURRENT SEC EDGAR DATA ----- */
	// INDEXES AND ARCHIVE DATA (master.gz, company.gz, and form.gz)
	let options_master = {'filetype':'master.gz','filedir_from':'./files/indexes/','startyear':1993,'endyear':2020,'quarters':quarters,'archive_url': 'https://www.sec.gov/Archives/edgar/full-index'}
	let options_company = {'filetype':'company.gz','filedir_from':'./files/companies/','startyear':1993,'endyear':2020,'quarters':quarters,'archive_url': 'https://www.sec.gov/Archives/edgar/full-index'}
	let options_form = {'filetype':'form.gz','filedir_from':'./files/forms/','startyear':1993,'endyear':2020,'quarters':quarters,'archive_url': 'https://www.sec.gov/Archives/edgar/full-index'}
	// FACT DATASET (smaller set than below) i.e. https://www.sec.gov/files/node/add/data_distribution/2020q1.zip)
	let options_dataset = {'filetype':'.zip','filedir_from':'./files/datasets/','startyear':2009,'endyear':2020,'quarters':quarters_short,'archive_url': 'https://www.sec.gov/files/dera/data/financial-statement-data-sets','filetypezip':['num.txt','pre.txt','tag.txt','sub.txt']}
	// COMPREHENSIVE FACT DATA SET https://www.sec.gov/files/dera/data/financial-statement-and-notes-data-sets/2019q4_notes.zip
	let options_dataset_add = {'filetype':'.zip','filedir_from':'./files/datasets_add/raw/','startyear':2009,'endyear':2020,'quarters':quarters_short,'archive_url': 'https://www.sec.gov/files/dera/data/financial-statement-and-notes-data-sets','filetypezip':['num.tsv','pre.tsv','tag.tsv','sub.tsv','dim.tsv','cal.tsv','ren.tsv'],'url_extender':'_notes'} //ignoring txt.tsv and 

/* -----MAIN DATASET CALL EXECUTION TO ITERATE THROUGH FOLDER AND OPTIONS----- */
	fetch_edgar_files(options_dataset_add,(results)=>{
			console.group('\x1b[32m MESSAGES \x1b[0m')
			console.log(results.fetch.messages)
			console.groupEnd()
			console.group('\x1b[33m WARNINGS \x1b[0m')
			console.debug(results.fetch.warnings)
			console.groupEnd()
			console.group('\x1b[31m ERRORS \x1b[0m')
			console.error(results.fetch.errors)
			console.groupEnd()
	})
/* -----CYCLE THROUGH SEC DATA FILES AND STORE/UNPACK THE ZIP / GZ FILE ----- */
async function fetch_edgar_files(options, callback){
	try{
		// ENSURE / CHECK OPTIONS
		if (options.filedir_from.slice(-1)!='/'){throw Error(`Output directory not formed correctly: ${options.filedir_from}`)} //throw error if malformed directory
		if (!fs.existsSync(options.filedir_from)){fs.mkdirSync(options.filedir_from)} //create directory if none exists
		if (!fs.lstatSync(options.filedir_from).isDirectory()){throw Error(`Input is not directory:${options.file_dir_from}`)} //check for creation or existance
		if(typeof(options.startyear)!='number' || typeof(options.endyear)!='number'){throw new Error(`Year must be a declared number variable : ${options.startyear} = ${typeof(options.startyear)}`)}
		currentyear = (new Date().getFullYear())
		if(options.startyear<1993 || options.endyear>currentyear){throw new Error(`Year must be a between: 1993 and ${currentyear}`)}
		let years = Array.from(new Array(options.endyear-options.startyear+1), (x,i) => i + options.startyear)
		var urlstofetch = []
		// CREATE MAP/ARRAY OF URLS TO FETCH		
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
		// SHOW HEADER BEFORE ITERATION
		console.log('-'.repeat(process.stdout.columns),chalk`\n${'-'.repeat(process.stdout.columns)}\n\nGetting Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nStart Year: {green ${options.startyear}}\nEnd Year: {green ${options.endyear}}\n\n${'-'.repeat(process.stdout.columns)}\n\n`)
		/* ----- ITERATE THROUGH YEARS AND QTR REQUEST AND RETREIVE FILES ----- */
		var i =0
		for(const url of urlstofetch){
			i++
			localfiletmp = options.filedir_from+url.split('/').slice(3).join('_')
			localfiletmp = localfiletmp.substr(0,localfiletmp.lastIndexOf('.'))
			localfile = (options.filetypezip===undefined) ? localfiletmp+'.txt' : localfiletmp
			// RETREIVE MAIN RESULTS
			results = {}
			results.fetch = await fetch_file({'url':url,'localfile':localfile,'filetypezip':options.filetypezip})
			// REPORT PROGRESS
			results.pi = {'STATUS': {'PROCESSING': i, 'of': urlstofetch.length}}
			results.pb = `${String('').padEnd(Math.round(percent_complete/100*(process.stdout.columns-20)),'░')} ${percent_complete}%`
			results.heap_mem_used =  [Math.round(process.memoryUsage().heapTotal/1024/1024),'MB']//show_mem_use()
			// CALLBACK RESULTS TO MAIN | Also a Wait in case: (SEC says no requesting 10 under 10 sec but since sync not issue)
			callback(results)
			await Delay(500)
		}
	}catch(err){
		console.log(err) // Log (or throw) any errors
	}
}

// -------FETCH FILE USING REQUEST, AND STORE LOCALLY----------- // 
function fetch_file(options) {
	//PROMISE RETURN OF FILE
	return new Promise(async function(resolve,reject){
		try{
			let results = {'messages':{},'warnings':{},'errors':{}}
			// IF FILE ALREADY EXISTS, EXIT
			if (fs.existsSync(options.localfile)) {
				// RETURN PROMISE RESOLVE
				results.warnings.fileexists = `Skipping: File Exists: ${options.localfile}`
				results.messages.localpath = options.localfile
				results.messages.remotepath = options.url
				results.messages.filesize = [parseInt(fs.statSync(options.localfile).size.toLocaleString()),filesizetypes[Math.round(Math.round(fs.statSync(options.localfile).size/results.messages.filesize).toString().length/3)+1]]
				return resolve(results)
			}else{
				if (!fs.existsSync(path.dirname(options.localfile))){
					fs.mkdirSync(path.dirname(options.localfile))
					results.messages.createddir = `Created Directory: ${path.dirname(options.localfile)}`
				}
				// REQUEST URL FROM FILE (UNZIP IF NECESSARY AND DEAL WITH FILES)
				http.get(options.url, function(response) {
					tmpfile = path.dirname(options.localfile)+'/tmp'+path.basename(options.localfile)+options.url.substr(options.url.lastIndexOf('.'))
					response.pipe(fs.createWriteStream(tmpfile))
					.on('finish',()=>{ 
						// IF INDEX FILE - USE GUNZIP FOR 1 FILE
						if(options.filetypezip === undefined){
							fs.createReadStream(tmpfile).pipe(zlib.createGunzip()).pipe(fs.createWriteStream(options.localfile))
							.on('finish',function (){
								fs.unlinkSync(tmpfile)
								if (fs.existsSync(options.localfile)){
									results.messages.status=(`File successfully created: ${options.localfile}`)
									results.messages.filesize =[parseInt(fs.statSync(options.localfile).size.toLocaleString()),filesizetypes[Math.round(Math.round(fs.statSync(options.localfile).size/results.messages.filesize).toString().length/3)+1]]
								}else{
									results.messages.status = 'Could not find finished file'
									results.messages.localpath = options.localfile
									results.messages.remotepath = options.url 
								}
								return resolve(results)
							})
						// OR IF DATASET FILE THEN .ZIP AND RETREIVE REQUESTED FILES
						}else{
							fs.createReadStream(tmpfile)
							.pipe(unzipper.Parse())
							.on('entry', function (entry) {
								// entry.path entry.type; entry.vars.uncompressedSize
								if(options.filetypezip.includes(entry.path)){entry.pipe(fs.createWriteStream(options.localfile+'_'+entry.path))} else {entry.autodrain()}
							})
							.on('finish',function(){
								fs.unlinkSync(tmpfile)
								results.messages = {filesize:[],status:[],localpath:[]}
								options.filetypezip.forEach(ft=>{
									localfile_unzipped = options.localfile+'_'+ft
									if (fs.existsSync(localfile_unzipped)){
										results.messages.status.push(`File successfully created: ${localfile_unzipped}`)			
										results.messages.filesize[parseInt(fs.statSync(localfile_unzipped).size.toLocaleString()),filesizetypes[Math.round(Math.round(fs.statSync(localfile_unzipped).size/results.messages.filesize).toString().length/3)+1]]
									}else{
										results.messages.status = 'Could not find finished file'
										results.messages.localpath.push(localfile_unzipped)
										results.messages.remotepath = options.url
									}
								})
								//RETURN RESULTS 
								return resolve(results)
							})			
						}
					})	
				})
			}
		}catch(err){
			throw err // throw error
		}
	})
}
/* ----- DELAY FUNCTION IF NEEDED ----- */
const Delay = (ms) => new Promise(r => setTimeout(r, ms))
