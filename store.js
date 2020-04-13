// Store.js
// ========
// Global storing functions - used by other files..

//DECLARE REQUIREMENTS
	const sqlite3 = require('sqlite3').verbose();
	const csv = require('csv-parser');
	const fs = require('fs');

// OPEN DATABASE		
	let db = new sqlite3.Database('./files/db/EDGAR_data.db', (err) => {
	   if (err) {
	    console.error(err.message);
		  }
		  console.log('Connected to the master_indexes database.');
	});

//CREATE DB TABLE IF IT DOESN'T EXIST
	db.run('CREATE TABLE IF NOT EXISTS master_indexes(CIK REAL,Company_Name text, Form_Type text, Date_Filed text, Filename text)');

//STORE IDX FILE INTO DATABASE
	function store_idx_file(idxfile, results){
		
		//LOG START OF FUNCTION
		console.log('started '+idxfile);
		
		//MAKE SURE WE HANDLE MEMORY WITH ASYNC FUNCTION	
		return new Promise(function(resolve,reject){	

			results = [] //STORE RESULTS IN ARRAY

				//USE CSV_PARSER TO GO THROUGH IDX
					fs.createReadStream(idxfile)
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
								console.log('CSV file successfully processed '+idxfile);

							//STORE IN DB
								var i,j,temparray,chunk = 199; //CAN ONLY CHUNK 1000 ENTRIES AT A TIEM 1000/5 COLUMSN
								for (i=0,j=results.length; i<j; i+=chunk) {
								temparray = results.slice(i,i+chunk);
										var objentry= Object.values(temparray).map(({CIK,Company_Name,Form_Type,Date_Filed,Filename})=>[CIK,Company_Name,Form_Type,Date_Filed,Filename]);
										
											let placeholders = new Array(chunk).fill(0).map((_,i) => '(?,?,?,?,?)' );
											
											db.run('INSERT INTO master_indexes(CIK,Company_Name,Form_Type,Date_Filed,Filename) VALUES '+placeholders,objentry.flat(),function(err) {
											    if (err) {
											      return console.log(err.message);
											    }
												    console.log(`A row has been inserted with rowid ${this.lastID}`);
											})
									}
							//RETURN PROMISE RESOLVE
								resolve(results)
					})
			})	
	}