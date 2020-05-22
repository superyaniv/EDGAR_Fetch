/*
merge.js
========
- Middleware to merge pre and num files.
- (Example) - simple - `node store/merge` 
*/

/* ----- FILE REQUIREMENTS  ----- */
var fs = require('graceful-fs')
const _ = require('lodash')

/* ----- OPTION SETS FOR CURRENT SEC EDGAR DATA ----- */
// (Example Usage): Datasets_add

const base_dir = '/Volumes/MacStore/EDGAR_Storage/datasets_add/json/'

main(
	{'destination_dir':`${base_dir}/numpre`,
	'first_obj_dir':`${base_dir}/pre`,
	'second_obj_dir':`${base_dir}/num`},
	(results)=>{
		console.log(results)
})
function main(options,callback){
	try{	
		const files = fs.readdirSync(options.first_obj_dir,{withFileTypes: true})
				.filter(dirent => dirent.isFile())
				.filter(dirent=>(dirent.name.split('.')[1] == 'json')) //.splice(0,3) -> to do a test case.
				.map(dirent => dirent.name)
		
		for(var i = 0; i<files.length; i++){
			let merge_obj = []
			if(fs.existsSync(`${options.second_obj_dir}/${files[i]}`)){
				const first_obj = JSON.parse(fs.readFileSync(`${options.first_obj_dir}/${files[i]}`))
				const second_obj = JSON.parse(fs.readFileSync(`${options.second_obj_dir}/${files[i]}`))
				merge_obj = Object.values(_.defaultsDeep({},first_obj,second_obj))
				fs.writeFileSync(`${options.destination_dir}/${files[i]}`,JSON.stringify(merge_obj,null,2))
			}
			callback({
				'Progress':`${i} of ${files.length}`,
				'File':files[i],
				'Object_Length':merge_obj.length,
				'Memory_Heap':[Math.round(process.memoryUsage().heapTotal/1024/1024),'MB']
				})
		}
		return callback('Done with Files')
	}catch(err){
		throw err
	}
}