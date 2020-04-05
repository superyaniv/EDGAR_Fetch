const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');
const fs = require('fs');
let EDGAR_store = require('./store.js')

var EDGAR_archive_url = 'https://www.sec.gov/Archives/edgar/full-index/'
const quarters = ['QTR1','QTR2','QTR3','QTR4']
const startyear = 2015; //1993 first year
const endyear = 2019;
var years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)

//-------

let db = new sqlite3.Database('./db/EDGAR_data.db', (err) => {
   if (err) {
    console.error(err.message);
	  }
	  console.log('Connected to the master_indexes database.');
});

db.run('CREATE TABLE IF NOT EXISTS master_indexes(CIK REAL,Company_Name text, Form_Type text, Date_Filed text, Filename text)');

//-------


idxfile = []
years.forEach(year=>
	quarters.forEach(function(qtr){
		idxfile.push('./files/unzipped_indexes/'+year+qtr+'.idx')
		})
	)

processArray(idxfile);	

async function processArray(array) {
  for (const item of array) {
    await EDGAR_store.store_idx_file(item)
 	console.log(item);
  }
  console.log('Done!');
}
async function delayedLog(item) {
  // notice that we can await a function
  // that returns a promise
  await delay(item);
  await EDGAR_fetch.store_idx_file(item)
  console.log(item);
}

function delay(item) {

  return new Promise(resolve=>setTimeout(resolve,300))
  //return new Promise(resolve => store_idx_file(item));
}


function store_idx_file(idxfile, results){
		
	console.log('started '+idxfile);
			
	return new Promise(function(resolve,reject){		
				results = []	
					fs.createReadStream(idxfile)
					  .pipe(
					  	csv({
					  		skipLines: 9,
					  		separator: '|',
					  		skipComments: '--------------------------------------------------------------------------------',
					  		mapHeaders: ({ header, index }) => header.replace(' ','_'),
					  		})
					  	)
					  .on('data', (data) => results.push(data))
					  .on('end', () => {
					  	console.log('CSV file successfully processed '+idxfile);
						//return new Promise(resolve => store_in_db(results))
						//Store in D
						//store_in_db(results)
							//return new Promise(resolve=>store_in_db())
							//resolve(results)
							var i,j,temparray,chunk = 199;
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
							resolve(results)
						})
		})	
}
