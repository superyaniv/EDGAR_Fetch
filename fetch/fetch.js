// fetch.js
// ========

//DECLARE REQUIREMENTS
	const http = require('https');
	const fs = require('fs');
	const path = require('path');
	const chalk = require('chalk');
// -------UNZIP FILES----------- //
	const zlib = require('zlib');

// DECLARE ALL THE VARIABLES
	const EDGAR_archive_url = 'https://www.sec.gov/Archives/edgar/full-index'

// DECLARE THE YEARS TO FETCH
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	const filesizetypes = ['Bytes','KB','MB','GB']


// --------EXAMPLE WITH OUTPUT RESULTS.------- //

//EXAMPLE INDEXES (master.gz)
	let options_masterindexes = {
		'filetype':'master',
		'local_path_dir':'./files/indexes/',
		'startyear':1993,
		'endyear':2020}
//EXAMPLE COMPANIES (company.gz)
	let options_company = {
		'filetype':'company',
		'local_path_dir':'./files/companies/',
		'startyear':1993,
		'endyear':2020}

//EXAMPLE RUN 
	fetch_edgar_files(options_masterindexes,(results)=>{
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
// --------BUILD PATH INFORMATION FOR FETCHING FILES----------- //
async function fetch_edgar_files(options, callback){
	try{
	//--VARIABLES-----
		//REDECLARE OPTIONS IN SCOPE
			const filetype = options.filetype
				if(options.local_path_dir.slice(-1)!='/'){throw new Error(`local_path_dir not a directory: ${options.local_path_dir}`)}
			const local_path_dir = options.local_path_dir
				if(typeof(options.startyear)!='number' || typeof(options.endyear)!='number'){throw new Error(`Year must be a declared number variable : ${options.startyear} = ${typeof(options.startyear)}`)}
			const startyear = options.startyear
			const currentyear = (new Date().getFullYear())
				if(options.startyear<1993 || options.endyear>currentyear){throw new Error(`Year must be a between: 1993 and ${currentyear}`)}
			const endyear = options.endyear
		//DECLARE VARS
			let years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)
			let urlstofetch = []
		//CREATE URLFETCH ARRAY		
			years.forEach(year=>
				quarters.forEach(function(qtr){
					if(year != currentyear || (quarters.indexOf(qtr)<Math.ceil((new Date().getMonth()+1)/3))){
						urlstofetch.push(`${EDGAR_archive_url}/${year}/${qtr}/${filetype}.gz`)
					}
				})
			)
		//SHOWING FUNCTION
			console.log('-'.repeat(process.stdout.columns))
			console.log(chalk`\n${'-'.repeat(process.stdout.columns)}\n\nGetting Filings: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nStart Year: {green ${startyear}}\nEnd Year: {green ${endyear}}\n\n${'-'.repeat(process.stdout.columns)}\n\n`)
			
	//--ITERATE ARRAY AND FETCH / UNZIP FILES--
		var i =0
		for(const urltofetch of urlstofetch){
			i++
			const pcomplete = Math.round(i/urlstofetch.length*100)
		 	// REMOTE AND LOCAL PATH TO STORE FILES
		 		const remotepath = urltofetch
		 		const localpath_gz = local_path_dir+urltofetch.split('/')[6]+'-'+urltofetch.split('/')[7]+'-'+urltofetch.split('/')[8]
		 		const localpath = localpath_gz.substr(0,localpath_gz.length-3)+'.txt'
			// GET FILE
				let results = {}
				results.fetch = await fetch_file(remotepath,localpath)
				
			// SHOWING PROGRESS------
					//STATUS CONSTANTS
					const conosolecoluns_offset = 10
					const consolecolumns = (process.stdout.columns-conosolecoluns_offset)
					const paddingprogress = Math.round(pcomplete/100*consolecolumns)
					const paddingtogo = consolecolumns-paddingprogress
					//SHOW STATUS
					cstatus = chalk`{white STATUS [${i} of ${urlstofetch.length}]}`
					console.log(chalk`\n{cyan.bold ${String(cstatus.padStart(process.stdout.columns/2+10,'-')).padEnd(process.stdout.columns,'-')}}`)
					console.log(chalk`{white ${String('[').padEnd(paddingprogress,'░')} ${pcomplete}%${String(']').padStart(paddingtogo,' ')}\n}`)
			//-----------------------
			//WAIT IN CASE
				await Delay(5)
			//CALLBACK RESULTS
				callback(results)
		}
	}catch(err){
		console.log(err)
	}
}

// -------FETCH FILE USING REQUEST, AND STORE LOCALLY----------- // 
function fetch_file(remotepath, localpath) {
	//PROMISE RETURN OF FILE
	return new Promise(async function(resolve,reject){

		try{
			let results = {'messages':{},'warnings':{},'errors':{}}
			//IF FILE ALREADY EXISTS, EXIT
			if (fs.existsSync(localpath)) {
				//RETURN PROMISE RESOLVE
				results.warnings.fileexists = `Skipping: File Exists: ${localpath}`
				results.messages.localpath = localpath
				results.messages.remotepath = remotepath
				results.messages.filesize = [parseInt(fs.statSync(localpath).size.toLocaleString()),filesizetypes[Math.round(Math.round(fs.statSync(localpath).size/results.messages.filesize).toString().length/3)+1]]
				resolve(results)
			}else{
				//CREATE DIRECTORY IF IT DOESNT ALREADY EXIST
				if (!fs.existsSync(path.dirname(localpath))){
					fs.mkdirSync(path.dirname(localpath))
					results.messages.createddir = `Created Directory: ${path.dirname(localpath)}`
				}
				//GET FILE FROM URL
				http.get(remotepath, function(response) {
					const unzip = zlib.createGunzip()
					const destination = fs.createWriteStream(localpath)
					//PIPE THE FILE
						let unzipfile = response.pipe(unzip).pipe(destination)
						.on('finish',()=>{
							if (fs.existsSync(localpath)){
								results.messages.status=(`File successfully created: ${localpath}`)
								results.messages.filesize =[parseInt(fs.statSync(localpath).size.toLocaleString()),filesizetypes[Math.round(Math.round(fs.statSync(localpath).size/results.messages.filesize).toString().length/3)+1]]
								results.messages.filesizetype = 'KB'
								resolve(results);		
							}else{
								results.messages.status = 'Could not find finished file'
								results.messages.localpath = localpath
								results.messages.remotepath = remotepath 
								resolve(results);		
							}
						})
					//RETURN PROMISE RESOLVE				
				})
			}
		}catch(e){
			console.error(e);
		}
	})
}


const Delay = (ms) => new Promise(r => setTimeout(r, ms));


module.exports = {fetch_file};
