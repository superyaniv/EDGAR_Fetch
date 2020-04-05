// EDGARfetch.js
// ========

// DECLARE THE REQUREMENT FILES 
let EDGAR_fetch = require('./fetch.js')
let EDGAR_store = require('./store.js')

// DECLARE ALL THE DIRECTORIES

	var EDGAR_archive_url = 'https://www.sec.gov/Archives/edgar/full-index/'
	const quarters = ['QTR1','QTR2','QTR3','QTR4']
	const startyear = 2020; //1993 first year
	const endyear = 2020;
	var years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)


// GET ALL THE INDEXES
function getIndexes(years,quarters){

	years.forEach(year=>
		quarters.forEach(function(qtr){
			urltofetch = EDGAR_archive_url+year+'/'+qtr+'/master.gz';
			console.log('Fetching: '+urltofetch);
			
			idxfile = 'https://www.sec.gov/Archives/edgar/full-index/2020/QTR1/master.gz','./files/zipped_indexes/'+year+qtr+'.gz'
			EDGAR_fetch.fetch_file(idxfile);
		}
		)
	)
}

// UNTAR ALL THE INDEXES
function unzip_Indexes(years,quarters){
	years.forEach(year=>
		quarters.forEach(function(qtr){
			var file_to_unzip = './files/zipped_indexes/'+year+qtr+'.gz';
			console.log('unzipping: '+file_to_unzip);
			EDGAR_fetch.unzip_file(file_to_unzip,'./files/unzipped_indexes/'+year+qtr+'.idx');
		}
		)
	)
}

// STORE ALL THE FILES
async function store_Indexes(years,quarters) {

	// CREATE ARRAY OF FILES
		idxfile = []
		years.forEach(year=>
			quarters.forEach(function(qtr){
				idxfile.push('./files/unzipped_indexes/'+year+qtr+'.idx')
			})
		)

	// ITERATE THROUGH FILESL BUT MAKE SURE SYNCRONOUS WITH AWAIT
		for (const item of idxfile) {
			await EDGAR_store.store_idx_file(item)
			console.log(item);
		}
	// FINISH
	  console.log('Done!');
}


store_Indexes(years,quarters);	
