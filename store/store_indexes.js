//store_indexes_json.js
//Store the indexes in json format

//REQUIREMENTS
	const fs = require('fs')
	const path = require('path');
	const chalk = require('chalk')
	const csv = require('csv-parser');
	const filesizetypes = ['Bytes','KB','MB','GB']

//ITERATE THROUGH DIRECTORY OF HEADERS TO PARSE AND STORE (SYNCRONOUSLY)
	//Example Usage: options ={'filedir_from':'./files/indexes/','filedir_to':'./files/indexes/json/'}
let options ={'filedir_from':'./files/companies/','filedir_to':'./files/companies/json/'}
store_indexes(options,(op_results)=>{
	console.log(op_results)
})

async function store_indexes(options,callback){
	try{

		//ENSURE STARTING FROM DIRECTORY
		if(!fs.lstatSync(options.filedir_from).isDirectory()){throw Error(`Input is not directory:${options.file_dir_from}`)}
		if(options.filedir_to.slice(-1)!='/'){throw Error(`Output directory not formed correctly: ${options.filedir_to}`)}
		const filedir_from = options.filedir_from
		const filedir_to = options.filedir_to
		//LOG THE INTENDED FUNCTION
		let starttime = new Date(Date.now())
		console.log(chalk`\n${''.padEnd(30,'_')}\n\nStoring Index Files: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nCIK: {green 10K Headers}\nStart Time: {green ${starttime.toString()}}\n\n\n`)
		//DELAY IF NEEDED...
		const Delay = (ms) => new Promise(r => setTimeout(r, ms));
		
			//ITERATE TRROUGH VARIABLES
			let files = fs.readdirSync(filedir_from,{withFileTypes: true})
			.filter(dirent => dirent.isFile())
			.map(dirent => dirent.name)
			
			for(var i = 0; i < files.length; i++){
					const filepath_from=filedir_from+files[i]
					const filepath_to=filedir_to+path.basename(files[i]).split('.')[0]+'.json'
					const pcomplete=Math.round((i+1)/(files.length)*100)

					//GET RESULTS FROM PARSER
					let storeresults = {}	
					storeresults = await store_JSON(filepath_from,filepath_to,i,files)

					//LOG RESULTS					
								// SHOWING PROGRESS------
					//STATUS CONSTANTS
					const conosolecoluns_offset = (String(pcomplete).length+4)
					const consolecolumns = (process.stdout.columns-conosolecoluns_offset)
					const paddingprogress = Math.round(pcomplete/100*consolecolumns)
					const paddingtogo = consolecolumns-paddingprogress
					//SHOW STATUS
					cstatus = chalk`{white STATUS [${i} of ${files.length}]}`
					console.log(chalk`\n{cyan.bold ${cstatus.padStart(process.stdout.columns/2+10,'-').padEnd(process.stdout.columns,'-')}}`)
					console.log(chalk`{white ${String('[').padEnd(paddingprogress,'░')} ${pcomplete}%${String(']').padStart(paddingtogo,' ')}\n}`)
					await Delay(50)
					callback(storeresults)
			}
		
	}catch(err){
		//CATCH ANY MAJOR ERRORS
		console.error(err)
	}
	return('Done')	
}	

//PARSER FOR THE INDEX FILES TO EXTRACT COMPANY DATA AND DOCUEMNT INFO / LOCATION
function parse_file(filepath_from,filepath_to,results){
	//USE CSV_PARSER TO GO THROUGH FILE
		//MAKE SURE WE HANDLE MEMORY WITH ASYNC FUNCTION	
		return new Promise(function(resolve,reject){
		results = []

		fs.createReadStream(filepath_from)
				.pipe(
					csv({
						skipLines: 9, //SKIP THE HEADER
						separator: '|',
						skipComments: '--------------------------------------------------------------------------------', //SKIP THIS LINE BUT STILL GET HEADER
						mapHeaders: ({ header, index }) => header.replace(' ','_'),
						})
					)
				.on('data', (data) => results.push(data))
				.on('end', () => {
					
					//PROCESSED THE CSV, NOW LOG AND STORE IN DB
						//WRITE THE FILE
						fs.writeFileSync(filepath_to, JSON.stringify(results))

						//REASSURE THE FILE EXISTS
						if(fs.existsSync(filepath_to)) {
							resolve(results)
						}		
					//console.log(results)
				})
		})
		//})
}

//CALL THE PARSER AND STORE THE JSON DOCUMENT
async function store_JSON(filepath_from,filepath_to,i,files,results){
	try{
	//DECLARE STATUS VARIABLES
		results = {}
			results.percent_complete=Math.round((i+1)/files.length*100)
			results.filesprocessed = i+1 
			results.filestoprocess = files.length
			results.base_path=files[i] 
			results.from_path=filepath_from
			results.to_path=filepath_to

	//TRY TO CREATE THE FILE AND STORE IT
		if (!fs.existsSync(path.dirname(filepath_to))){
					fs.mkdirSync(path.dirname(filepath_to))
					results.createddir = `Created Directory: ${path.dirname(filepath_to)}`
			}
		if(!['txt','idx'].includes(filepath_from.split('.')[2])){
			results.error =(`Skipping: Incorrect Filetype... ${filepath_from}`)
		}
		if(fs.existsSync(filepath_to)) {
			results.warning = (`Skipping: File Exists... ${filepath_to}`)
		}
		if(!results.error && !results.warning){
			//PARSE THE RESULTS
			x = await parse_file(filepath_from,filepath_to,results.json)
		}
		if(fs.existsSync(filepath_to)) {
			results.filesize = [parseInt(fs.statSync(filepath_to).size.toLocaleString()),filesizetypes[Math.round(Math.round(fs.statSync(filepath_to).size/results.filesize).toString().length/3)+1]]
			results.status = 'OK'
			return results
		}
		
	}catch(err){
		console.log(err)
	}
}	

