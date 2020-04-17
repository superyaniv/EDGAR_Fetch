//store_headers.js
//Store the 10K Headers into a Database

//REQUIREMENTS
	const fs = require('fs')
	const cheerio = require('cheerio')
	const path = require('path');
	const chalk = require('chalk')

//STORE THE HEADERS USING THE PROCEEDING FUNCTIONS
	var filedir_from = './files/filings/10KHeaders/'
	var filedir_to = './files/filings/10KHeaders_json/'

//ITERATE THROUGH DIRECTORY OF HEADERS TO PARSE AND STORE (SYNCRONOUSLY)
	//Example Usage: store_headers(filedir_from,filedir_to)

store_headers(filedir_from,filedir_to)

async function store_headers(filedir_from,filedir_to){
	try{
		//ENSURE STARTING FROM DIRECTORY
		if(!fs.lstatSync(filedir_from).isDirectory() || !fs.lstatSync(filedir_to).isDirectory()){
			throw Error('Input is not directory.')
		}
		//LOG THE INTENDED FUNCTION
		let starttime = new Date(Date.now())
		console.log(chalk`\n${''.padEnd(30,'_')}\n\nStoring Header Files: {yellowBright EDGAR Search (Written by Yaniv Alfasy)}\nCIK: {green 10K Headers}\nStart Time: {green ${starttime.toString()}}\n\n\n`)
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
						await Delay(5)
			}
		
	}catch(err){
		//CATCH ANY MAJOR ERRORS
		console.error(err)
	}
	return('Done')	
}	

//PARSER FOR THE INDEX FILES TO EXTRACT COMPANY DATA AND DOCUEMNT INFO / LOCATION
function parse_header(filepath_from,parsed_data){ 
	//STORE FILEPATH INFORMATION
		const filepath_start = path.dirname(filepath_from)
		const filepath_tail = path.basename(filepath_from)
		const filepath_url_tail_CIK=filepath_tail.split(filepath_tail.substring(filepath_tail.indexOf('-')-10,filepath_tail.indexOf('-')))[0].replace('edgardata','')
		const filepath_url_tail_folder=filepath_tail.substring(0,filepath_tail.indexOf('-')-10).replace('edgardata','').replace(filepath_url_tail_CIK,'')
		const filepath_url = 'https://www.sec.gov/Archives/edgar/data/'+filepath_url_tail_CIK+'/'+filepath_url_tail_folder+'/'
		const filepath = filepath_start+'/'+filepath_tail
		var data = fs.readFileSync(filepath, 'utf8')
		data=data.replace(/&lt;/gi,'<')
		data=data.replace(/&gt;/gi,'>')

	//-------STORE FILER HEADER INFORMATION IN OBJECT-------//
	  	//CLEAN THE HEADER
	  	sec_header = data.match(/<SEC-HEADER>(.|\n)*?<\/SEC-HEADER>/gi)[0]
		tmp_arr = sec_header.split('\n')
		
		//MAKE IT LOOK MORE LIKE HTML - semi xml~like data for cheerio to read
		header_html = tmp_arr.map((x)=>{
			if((x.search('/')>0) || (sec_header.search(`/${x.split('>')[0].replace('<','')}`)>0))
				{
					return `${x}`
				}else{
					return `${x}</${x.split('>')[0].replace('<','')}>`
				}
			})
		
		//LOAD WITH CHEERIO
		var $ = cheerio.load(header_html.join(''))
		filer_facts={}
		filer_header = {}
	 	$('SEC-HEADER *').each(function(i, el) {
	  			if(el.children.length>1){
					filer_facts={}
				}else{
					filer_facts[el.name.replace('-','_')] = ($(this).text())
					filer_header[el.parent.name.replace('-','_')] = (filer_facts)
				}
		});
	 	
	 	//FINAL OBJECT {filer_header}

	//CLEAN DOC DATA - semi xml~like data for cheerio to read
		doc_data = data.match(/<DOCUMENT>(.|\n)*?<\/DOCUMENT>/gi).toString()
		tmp_arr = doc_data.split('\n')
		doc_html = tmp_arr.map((x)=>{
			if((x.search('/')>0) || (doc_data.search(`/${x.split('>')[0].replace('<','')}`)>0))
			{
				return `${x}`
			}else{
				return `${x}</${x.split('>')[0].replace('<','')}>`
			}
		})
		var $ = cheerio.load(doc_html.join(''))

	//-------STORE DOCUMENT DATAINFORMATION IN OBJECT-------//
		let document_facts =  {}
		let document_data = {}
		let document_data_set = {}

		$('DOCUMENT').each(function(i,el){
			document_facts={}
			document_links={}
			//ATTACH FILING DATE AND TAIL FOR LOOKUP
			document_facts['filing_date'] = filer_header['sec_header'].period
			document_facts['filing_url_tail'] = filepath_url
			$(this).find('a').each((i,e)=>{
				document_links[i]=(
					{'name': $(e).text(),
					'href': $(e).attr('href')})
			})
			document_facts['links'] = (document_links)
			$(this).children().each(function(x,el){
	  			if(el.children.length>1){
					document_facts={}
				}else{
					if($(this).text() && el.name!='a'){
						document_facts[el.name] = ($(this).text())
						document_data[i+1] = (document_facts)

					}
				}		
						
			})
			document_data_set['documents']=(document_data)
		})
		//FINAL OBJECT {document_data_set}
			
	 //COMBINE BOTH DATA SETS
	 	let filer_headers_10k = Object.assign(filer_header,document_data_set)
	 	
	 	//FINAL COMBINED OBJECT {filer_headers_10k}
	 		
	//CREATE PASSABLE JSON STRING
		let jsondata = JSON.stringify(filer_headers_10k);
	
	//RETURN THE JSON STRING ALONG WITH SOME OTHER INFORMATION
		parsed_data = {}
		parsed_data.company_name = (typeof filer_header.company_data  !== "undefined") ?filer_header.company_data.conformed_name	: ''
	 	parsed_data.jsondata = jsondata
	 	parsed_data.items_filer = Object.keys(filer_header).length
	 	parsed_data.items_document = Object.keys(document_data_set.documents).length
	
	//FINAL RETURN
		return parsed_data
}

//CALL THE PARSER AND STORE THE JSON DOCUMENT
function store_JSON(filepath_from,filepath_to,i,files){
	//DECLARE STATUS VARIABLES
		let results = {}
			results.percent_complete=Math.round(i/files.length*100)
			results.filestatus= i 
			results.filestatus_length= files.length
			results.base_path=files[i] 
			results.from_path=filepath_from
			results.to_path=filepath_to

	//TRY TO CREATE THE FILE AND STORE IT
	try{
		if(filepath_from.split('.')[2] != 'html'){
			results.error =('Skipping: Incorrect Filetype...')
		}
		if(fs.existsSync(filepath_to)) {
			results.warning = ('Skipping: File Exists...')		
		}
		if(!results.error && !results.warning){
			//PARSE THE RESULTS
			parsed_results = parse_header(filepath_from)
				results.company_name = parsed_results.company_name
				results.parsed_items_filer = parsed_results.items_filer
				results.parsed_items_document = parsed_results.items_document
				
			//WRITE THE FILE
			fs.writeFileSync(filepath_to, parsed_results.jsondata)
			
			//REASSURE THE FILE EXISTS
			if(fs.existsSync(filepath_to)) {
				results.filecreated = true	
				results.filesize = Math.round(fs.statSync(filepath_to).size/1000)+' KB'
				results.timecreated = ((fs.statSync(filepath_to).birthtime).toString())
			}
		}else{
			results.status = ('Warning.')
		}
	}catch(err){
		console.error(err)
	}

	//RETURN THE RESULTS
		return results//'File Stored Successfully.'
}	

