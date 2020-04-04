// fetch.js
// ========
const http = require('https');
const fs = require('fs');

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


module.exports = {fetch_file};
