// EDGARfetch.js
// ========

let fsfetch = require('./fetch.js');
var EDGAR_archive_url = 'https://www.sec.gov/Archives/edgar/full-index/';
var quarters = ['QTR1','QTR2','QTR3','QTR4'];
const startyear = 1993;
const endyear = 2019;

var years = Array.from(new Array(endyear-startyear+1), (x,i) => i + startyear)

	years.forEach(year=>
		quarters.forEach(function(qtr){
			urltofetch = EDGAR_archive_url+year+'/'+qtr+'/master.gz'
			console.log('Fetching: '+urltofetch)
			fsfetch.fetch_file('https://www.sec.gov/Archives/edgar/full-index/2020/QTR1/master.gz','./files/'+year+qtr+'.gz');
		}
		)
	)

	
// fsfetch.fetch_file('https://www.sec.gov/Archives/edgar/full-index/2020/QTR1/master.gz','./files/test.z');
