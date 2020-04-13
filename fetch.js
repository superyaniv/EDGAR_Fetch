// fetch.js
// ========

//DECLARE REQUIREMENTS
	const http = require('https');
	const fs = require('fs');
	const zlib = require('zlib');
	const path = require('path');

//FETCH FILE USING REQUEST, AND STORE LOCALLY
function fetch_file(url, filepath) {
	//PROMISE RETURN OF FILE
	return new Promise(function(resolve,reject){

		try{
			//IF FILE ALREADY EXISTS, EXIT
			if (fs.existsSync(filepath)) {
				//RETURN PROMISE RESOLVE
				resolve('Skipping: File Exists');
			}else{	
			
				//CREATE DIRECTORY IF IT DOESNT ALREADY EXIST
				if (!fs.existsSync(path.dirname(filepath))){
					fs.mkdirSync(path.dirname(filepath))
				}
				//GET FILE FROM URL
					const file = fs.createWriteStream(filepath);
					const request = http.get(url, function(response) {
				  response.pipe(file);
				//RETURN PROMISE RESOLVE
				resolve('Success: File Stored');
				})
					
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
