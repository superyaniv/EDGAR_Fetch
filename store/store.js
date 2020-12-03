/*
store.js
========
- Middleware to process and stores files in a more appropriate index for executing distribution and restful API. 
- (Example) - simple - `node store/store` - (Example) - with memory heap limit higher - `node --max-old-space-size=8192 store/store`- (Example) - with inspect memorgy and garbage collection - `node --expose-gc --inspect store/store`
*/

/* ----- FILE REQUIREMENTS  ----- */
var fs = require('graceful-fs')
const path = require('path')
const parse = require('csv-parse')
const transform = require('stream-transform')
const _ = require('lodash')
const raw_data = `/Volumes/MacStore/EDGAR_Storage/datasets_add/raw` // location of fetch tsv files
const json_data = `/Volumes/MacStore/EDGAR_Storage/datasets_add/json` // location to store json files


/* ----- CREATE ADSH LOOKUP (AND SUB MAPPING) - CIK TO SUB INFO AND ADSH /CIK MAPPING ----- */ // Example: console.log(adsh_lookup['0000038074-09-000029'][0].cik)
const adsh_lookup = sub_info_map( 
	{'sub_rawfiledir':`${raw_data}/sub`,
	'sub_jsonfiledir':`${json_data}/sub`},
	(results)=>console.log(results)).adsh_cik_map

/* ----- STORE VARIABLES ----- */
var total_written = 0, total_time_elapsed = 0
const starttime = new Date()

/* ----- OPTION SETS FOR CURRENT SEC EDGAR DATA ----- */
// (Example Usage): Datasets_add/
const options_datasets_add_main_num ={'filedir_from':`${raw_data}/num`,'filedir_to':`${json_data}/num`}
const options_datasets_add_main_pre ={'filedir_from':`${raw_data}/pre`,'filedir_to':`${json_data}/pre`}
const option_set = [options_datasets_add_main_pre,options_datasets_add_main_num]


/* -----MAIN DATASET CALL EXECUTION TO ITERATE THROUGH FOLDER AND OPTIONS----- */
const promises = []
// Go through all option sets.
option_set.map((optionitem)=>{
	promises.push(store_indexes(optionitem,(results)=>{
		console.log(results)
	}))
})

// Promise all results and then create merge file.
Promise.all(promises)
	.then(response =>{
		response.forEach(responseitem=>
			responseitem[1].forEach(async (file)=>{
					file.close() // Close file before processing
					try{
						await new Promise(fulfill=> file.on('finish',fulfill)) // Wait for any writing to finish.
						console.log(file.path) // Potentially run other final commands here.
					}catch(err){throw err} // Error check
				}
			)
		)
})

/* -----CYCLE THROUGH FILES AND STORE EACH INDEX----- */
function store_indexes(options,callback){
	return new Promise(resolve=>{
		try{
			// Ensure source directory exists. Create directory if not exists. Show function information.
			if (!fs.lstatSync(options.filedir_from).isDirectory()){throw Error(`Input is not directory:${options.file_dir_from}`)} //check for creation or existance
			/* ----- MAIN FILE CYCLE ----- */
			console.log(`\n${''.padEnd(30,'_')}\n\nStoring Index Files: EDGAR Search (Written by Yaniv Alfasy)\nCIK: Store and Format\nStart Time: ${starttime.toString()}\n\n\n`)
			const files = fs.readdirSync(options.filedir_from,{withFileTypes: true})
				.filter(dirent => dirent.isFile())
				.filter(dirent=>(dirent.name.split('.')[1] == 'tsv')) //.splice(0,3) -> to do a test case.
				.map(dirent => dirent.name)
			console.log(files)
			let curfile=0
			const destination_files = new Map() // Create writestream mapping
			for(i = 0; i<files.length; i++){
				/* ----- PARSE FILE ----- */
				parse_file(
					{'filepath_from':`${options.filedir_from}/${files[i]}`,
					'filedir_to':`${options.filedir_to}`,
					'destination_files':destination_files}
				,(results)=>{
					curfile++
					total_time_elapsed = (Date.now()-starttime) // Milliseconds
					callback({...{
						'Files_Started':i,
						'Completed': [curfile,`of`,files.length],
						'Progress':[`${String('').padEnd(Math.round(Math.round(curfile/files.length*100)/100*(process.stdout.columns-30)),'░')}`,`${Math.round(curfile/files.length*100)}%`],
						'Total_Written':[Math.round(total_written/1024/1024),'MB'],
						'Write_Speed':[Math.round((total_written/total_time_elapsed/1000)),'MB/s'],
						'Time_Elapsed':[Math.round(total_time_elapsed/1000),'Seconds'],
						'Memory_Heap_Size':[Math.round(process.memoryUsage().heapTotal/1024/1024),'MB']
					}, ...results}) // Callback all results		
					if(curfile==files.length){
						destination_files.forEach(file=>file.write(`]`))
						resolve([options.filedir_from,destination_files])
					}
				})				
			}
		}catch(err){throw err} // Error Catch
	})
}	

/* -----PARSE THE CSV OR TSV FILE AND STORE AS JSON----- */
async function parse_file(options,callback){
	try{
		// Ensure destination file exists. Create directory if not exists.
		if(!fs.existsSync(options.filedir_to)){fs.mkdirSync(options.filedir_to)}
		// Source Stream
		const source = fs.createReadStream(options.filepath_from,'utf8')
		// Parser 
		const parser = parse({delimiter:"\t",quote:'',header:true,columns:true,ltrim:true,rtrim:true,cast:true})
		// Transformer Pipe
		const transformer = transform((record, callback) => {
			setImmediate( () => {
				const record_cik_obj = {'cik_company_info':adsh_lookup[record.adsh][0]}
				const record_cik = record_cik_obj.cik_company_info.cik 
				const cik_filekey = `${options.filedir_to}/${record_cik}.json`
				if(!options.destination_files.has(cik_filekey)){
					options.destination_files.set(cik_filekey,fs.createWriteStream(`${cik_filekey}`,'utf8'))
					options.destination_files.get(cik_filekey).write(`[`) //Write opening json
					options.destination_files.get(cik_filekey).write(`${JSON.stringify(record,null,2)}`)
					callback(null,JSON.stringify(record,null,2)) // Intermediate callback
				}else{
					options.destination_files.get(cik_filekey).write(`,${JSON.stringify(record,null,2)}`)
					callback(null,JSON.stringify(record,null,2))} // Intermediate callback

				}, 0)
		},{parallel: 1})
		// STREAM FLOW CONTROL
		transformer.on('data',(chunk)=>{total_written += chunk.length})
		transformer.on('error',function(err){throw err})
		// PIPE ALL THE STREAMS
		source.pipe(parser).pipe(transformer)//.pipe(process.stdout)//transformer)
		.once('end', function(){
			return callback({
				'Current_File':options.filepath_from,
				'Status':`Parsed and Stored File.`})
		})
	}catch(err){throw err} //Error Catching
}

/* -----SUB MAPPING - STORE ALL SUB CIKS AND CREATE ADSH AND SUB CIK MAPPING----- */
function sub_info_map (options,callback){	
	try{
		if(!fs.existsSync(options.sub_jsonfiledir)){
			callback(`Creating directory ${options.sub_jsonfiledir}`)
			fs.mkdirSync(options.sub_jsonfiledir)} //create write directory if not exists
		if(!fs.existsSync(`${options.sub_jsonfiledir}/cik_sub_map.json`) || !fs.existsSync(`${options.sub_jsonfiledir}/adsh_cik_map.json`) ){ //main check for adshtocikmap
			callback(`Subs have not been processed, processing directory ${options.sub_rawfiledir}`)
			const files = fs.readdirSync(options.sub_rawfiledir,{withFileTypes: true})
				.filter(dirent => dirent.isFile())
				.filter(dirent=>(dirent.name.split('.')[1]=='tsv')) //ensure tsv
				.filter(dirent=>(dirent.name.split('.')[0].slice(-3)=='sub')) //ensure sub
				.map(dirent => dirent.name)
			var newjson = [] //new obj to write
			for(i=0;i<files.length;i++){
				const file = files[i]
				fs.readFileSync(`${options.sub_rawfiledir}/${file}`,'utf8').split('\n').forEach(function(record,index){
					if(index==0){
						headers=record.split('\t')
					}else{
						if(record.length>0){
							jsonrecord ={}
							record.split('\t').forEach(function(v,i){
								v=(Number(v)) ? parseInt(v) : v
								jsonrecord[headers[i]]= v
							})
							newjson.push(jsonrecord)
						}
					}
				})
				callback({files:[i+1,'of',files.length],'Records':newjson.length,'Memory_Heap':[Math.round(process.memoryUsage().heapTotal/1024/1024),'MB']})
			}	
			callback(`Creating sub cik independent files in ${options.sub_jsonfiledir}`)
			const cik_sub_map_obj =_.groupBy(Object.values(newjson),function(o){return o.cik})
			for (let [key, value] of Object.entries(cik_sub_map_obj)) {
				fs.writeFileSync(`${options.sub_jsonfiledir}/${key}.json`,JSON.stringify(value,null,2))
			}
			callback(`Creating cik to sub file map ${options.sub_jsonfiledir}/cik_sub_map.json`)
			fs.writeFileSync(`${options.sub_jsonfiledir}/cik_sub_map.json`,JSON.stringify(cik_sub_map_obj,null,2))
			
			callback(`Creating adsh to cik map ${options.sub_jsonfiledir}/adsh_cik_map.json`)
			const adsh_cik_map_obj =_.groupBy(Object.values(newjson),function(o){return o.adsh})
			fs.writeFileSync(`${options.sub_jsonfiledir}/adsh_cik_map.json`,JSON.stringify(adsh_cik_map_obj,null,2))
		}
		return {'cik_sub_map': require(`${options.sub_jsonfiledir}/cik_sub_map.json`),'adsh_cik_map': require(`${options.sub_jsonfiledir}/adsh_cik_map.json`)} //return cik_sub_map file.
	}catch(err){
		throw err
	}
}
