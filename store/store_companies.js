
//store_companies.js
//Creates json files for each CIK from index files divided by year. 
//Mya need to set memory limit higher than standard node limit - e.g. ('node --max-old-space-size=8192 store_companies.js')

//REQUIREMENTS
	const fs = require('fs')
	const path = require('path')
	const chalk = require('chalk')
	var _ = require('lodash')
	const quarters = ['QTR1','QTR2','QTR3','QTR4']



//FOR INPUT OPTIONS - NEED A SET OF CIKS TO GET DATA FROM INDEXES
	topCIKs = []
	let rawdata = fs.readFileSync(path.join(__dirname, '../files/db/json/autocomplete_names.json'))	
	let top_companies = JSON.parse(rawdata)

	Object.values(top_companies)[0].forEach((item)=>{
		topCIKs.push(parseInt(item.CIK))
	})

//EXAMPLE OPTIONS
let options = {
	'filedir_from' = path.join(__dirname, '../files/indexes/json')
	'fildir_to' = path.join(__dirname, '../files/indexes/json/json_companies')
	'CIKs' = topCIKs
}

//FUNCTION
function store_companies(options,results){
	try{
		//GET OPTIONS
		const filedir_to = options.filedir_to
		const filedir_from = options.filedir_from
		const CIKs = options.CIKs

		//GET ALL THE INDEX FILES IN THE DIRECTORY
		const index_files = fs.readdirSync(filedir_from,{withFileTypes: true})
					.filter(dirent => dirent.isFile())
					.filter(dirent=>(dirent.name.split('.')[1]=='json'))
					.map(dirent => dirent.name)
		
		//DECLARE OBJECTS (WILL BE LARGE)
			let filing_obj =[]
			let tmpfiling_obj = []
		
		//ITERATE THROUGH FILES TO CREATE ONE LARGE OBJECT TO FILTER
		for(var i = 0; i < index_files.length; i++){
			const filename_from = index_files[i]
			const filepath_from =filedir_from+'/'+index_files[i]
			const year = parseInt(filename_from.substr(0,filename_from.indexOf('-')))
			const qtr = quarters.indexOf(filename_from.substr(filename_from.indexOf('-')+1,4))
			console.log(year,qtr)
			let source_file = fs.readFileSync(filepath_from)
			tmpfiling_obj.push(JSON.parse(source_file))
			//might need to flatten every time//tmpfiling_obj = tmpfiling_obj.flat(infinity)
		}

		//FLATTEN THE ARRAY OBJECT
			tmpfiling_obj = tmpfiling_obj.flat(infinity)

		//GO THROUGH CIKS AND CREATE INDIVIDUAL FILES FOR RETREIVAL
		for(CIK of CIKs){
			//WHERE TO STORE
			const filepath_to = filedir_to+'/'+CIK+'.json'
			
			//FILTER FILING OBJECT
			filing_obj = _.filter(tmpfiling_obj, function(e){return parseInt(e.CIK)==CIK})
			
			//WRITE TO FILE
			fs.writeFileSync(filepath_to, JSON.stringify(filing_obj), function (err,CIKfilings) {
							if (err) return console.log(err);
							console.log(CIKfilings,filepath_to)
							console.log(`Wrote to file: ${filepath_to}`);
						})
		}

	}catch(err){
		throw err
	}
}






