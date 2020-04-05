// fetch.js
// ========
const http = require('https');
const fs = require('fs');
const zlib = require('zlib');

function fetch_file(url, filepath) {
	try{
		const file = fs.createWriteStream(filepath);
		const request = http.get(url, function(response) {
		  response.pipe(file);
		})
	}catch(e){
		console.error(e);
	}
};
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
