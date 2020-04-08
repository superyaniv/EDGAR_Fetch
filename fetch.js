// fetch.js
// ========
const chalk = require('chalk');
const http = require('https');
const fs = require('fs');
const zlib = require('zlib');
var path = require('path');

function fetch_file(url, filepath) {

	return new Promise(function(resolve,reject){

		try{
			//IF FILE ALREADY EXISTS, EXIT
			if (fs.existsSync(filepath)) {
					//console.log(chalk`{yellow ${''.padEnd(' ',5)} Skipping: File Already Exists}: {dim ${filepath}}`)

					//RETURN PROMISE RESOLVE
						resolve('Skipping: File Exists');
			}else{	
				
				//CREATE DIRECTORY IF IT DOESNT ALREADY EXIST
					if (!fs.existsSync(path.dirname(filepath))){
				    	fs.mkdirSync(path.dirname(filepath));
				    	//console.log(chalk`{green Made new Directory: }{bold ${path.dirname(filepath)}}`)
					}
				
				//GET FILE FROM URL
							
					const file = fs.createWriteStream(filepath);
					const request = http.get(url, function(response) {
					  response.pipe(file);
					  resolve('Success: File Stored');
					})
					
					//console.log(chalk`{green.bold File Created Successfully: }{white.bold ${filepath}}`)
					
				//RETURN PROMISE RESOLVE
					
			}
		}catch(e){
			console.error(e);
		}
	

	})
}
function unzip_file(gzFile, target) {
	try{
		const fileContents = fs.createReadStream(gzFile);
		const writeStream = fs.createWriteStream(target);
		const unzip = zlib.createGunzip();
		fileContents.pipe(unzip).pipe(writeStream);
	}catch(e){
		console.error(e);
	}
}

module.exports = {fetch_file,unzip_file};
