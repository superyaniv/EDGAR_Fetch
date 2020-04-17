//index_store.js
//Store the 10K Headers into a Database

//REQUIREMENTS
	const fs = require('fs')
	const cheerio = require('cheerio')
	const path = require('path');
	const chalk = require('chalk')
	const csv = require('csv-parser');

//STORE THE HEADERS USING THE PROCEEDING FUNCTIONS
	var filedir_from = './files/unzipped_indexes/'
	var filedir_to = './files/filings/indexes_json/'

//ITERATE THROUGH DIRECTORY OF HEADERS TO PARSE AND STORE (SYNCRONOUSLY)
	//Example Usage: store_indexes(filedir_from,filedir_to)
store_indexes(filedir_from,filedir_to)
async function store_indexes(filedir_from,filedir_to){
	try{
		//ENSURE STARTING FROM DIRECTORY
		if(!fs.lstatSync(filedir_from).isDirectory() || !fs.lstatSync(filedir_to).isDirectory()){
			throw Error('Input is not directory.')
		}
		//LOG THE INTENDED FUNCTION
		let starttime = new Date(Date.now())
		console.log(chalk`\n${''.padEnd(30,'_')}\n\nStoring Index Files: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nCIK: {green 10K Headers}\nStart Time: {green ${starttime.toString()}}\n\n\n`)
		//DELAY IF NEEDED...
		const Delay = (ms) => new Promise(r => setTimeout(r, ms));
		
			//ITERATE TRROUGH VARIABLES
			files = fs.readdirSync(filedir_from)
			for(var i = 0; i < files.length; i++){
					const filepath_from=filedir_from+files[i]
					const filepath_to=filedir_to+path.basename(files[i]).split('.')[0]+'.json'
					const pcomplete=Math.round(i/files.length*100)

					//GET RESULTS FROM PARSER
					results = {}	
					results = await store_JSON(filepath_from,filepath_to,i,files)

					//LOG RESULTS					
					console.log(chalk`{yellow.bold STATUS}{cyan.italic -  ${i} of ${files.length}}`)
					console.log(chalk`Progress:{yellow ${String('[').padEnd(pcomplete,'░')} ${pcomplete}%${String(']').padStart(100-pcomplete,' ')}}`)
					console.log(results)
						await Delay(50)
			}
		
	}catch(err){
		//CATCH ANY MAJOR ERRORS
		console.error(err)
	}
	return('Done')	
}	

//PARSER FOR THE INDEX FILES TO EXTRACT COMPANY DATA AND DOCUEMNT INFO / LOCATION
function parse_file(filepath_from,filepath_to,results){
	//USE CSV_PARSER TO GO THROUGH IDX
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
						console.log('CSV file successfully processed '+filepath_from);
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
	//DECLARE STATUS VARIABLES
		results = {}
			results.percent_complete=Math.round(i/files.length*100)
			results.filestatus= i 
			results.filestatus_length= files.length
			results.base_path=files[i] 
			results.from_path=filepath_from
			results.to_path=filepath_to

	//TRY TO CREATE THE FILE AND STORE IT
	try{
		if(filepath_from.split('.')[2] != 'idx'){
			results.error =('Skipping: Incorrect Filetype...')
		}
		if(fs.existsSync(filepath_to)) {
			results.warning = ('Skipping: File Exists...')		
		}
		if(!results.error && !results.warning){
			//PARSE THE RESULTS
			x = await parse_file(filepath_from,filepath_to,results.json)
			results.status = 'OK'
			return results
		}else{
				results.status = ('Warning.')
		}
	}catch(err){
		console.log(err)
	}

	//RETURN THE RESULTS
		return results//'File Stored Successfully.'
}	

