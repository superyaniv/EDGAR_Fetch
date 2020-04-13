// query.js
// Query the Index database for filing index store information.

// DECLARE REQUIREMENTS
	const sqlite3 = require('sqlite3').verbose();
	const fs = require('fs')
	const path = require('path');

//QUERIES AND VIEWS DECLARATION
	//FILERS OVER THE LAST YEAR COUNTING THE FILINGS
	const createViewTopEarlyFilers = 
		`CREATE VIEW IF NOT EXISTS top_recent_filers as SELECT * FROM
		(SELECT 
			COUNT(DISTINCT(Filename)) AS filecount,
			*
			FROM master_indexes 
			WHERE (Date_Filed BETWEEN date('2019-01-01') AND date('2020-12-31')) 
			GROUP BY Company_Name) AS recentfilers
		ORDER BY recentfilers.filecount DESC`
		//Find all filers with 10Ks in the last 18 months as top filers

	//FILERS WITH 10-KS
	const SQL_Recent_Filers_2_Yrs = 
		`SELECT DISTINCT(Company_Name),* 
			FROM master_indexes 
			WHERE 
			(Julianday('now') - JulianDay(Date_Filed)) < 540
			AND 
			Form_Type = '10-K' 
			GROUP BY Company_Name`;		

	//FILERS WITH 10-K AND QS
	const TopFilersWith10K = 
		`SELECT * FROM top_recent_filers 
		WHERE Form_Type='10-K' or Form_Type='10-Q' 
		GROUP BY Company_Name ORDER by filecount DESC` 
// OPEN DATABASE		
	let db = new sqlite3.Database('./files/db/EDGAR_data.db', (err) => {
	   if (err) {
	    console.error(err.message);
		  }
		  console.log('Connected to the master_indexes database.');
	});

// QUERY THE DATABASE AND AND RETURN ALL INFO
	function query_CIK_Filings(options,callback){
		//ENSURE CIK IS DEFINED
	  	if(options.CIK == undefined){
			return callback([{'Error': 'CIK Not Defined'}])
			
		}
		
		var CIK = options.CIK || ''
		var start_date = options.start_date || (new Date().setFullYear(new Date().getFullYear() - 1))
		var end_date = options.end_date || Date.now()
		var limit = options.limit || 1000

		let sql = `
			SELECT * FROM master_indexes 
			WHERE CIK = '${CIK}' 
			AND Date_Filed BETWEEN date('${start_date}') AND date('${end_date}') 
			ORDER BY date(Date_Filed) DESC
			LIMIT ${limit}
			`;
			
		console.table(sql)
		
		db.all(sql,[], (err, rows)=>{
			
			if (err) {
				throw err;
			}
		
			console.table(rows)
			return callback(rows)
		})
	}
// var Form_Type = `WHERE Form_Type=${options.Form_Type} ` || ``


// QUERY THE DATABASE AND AND RETURN ALL INFO
async function query_Autocomplete_Names(callback){
	try{
		//Check if View Exists	
		const sql_CheckViewExists = 
			`SELECT name 
			FROM sqlite_master 
			WHERE type='view' AND name='autoCompleteNames';`
		//Create new view with top filers
		const sql_CreateView = 
			`CREATE VIEW IF NOT EXISTS autoCompleteNames AS ${SQL_Recent_Filers_2_Yrs};`
		//Query all names for autocomplete
		const sql_Autocomplete = 
			`SELECT * 
			FROM autoCompleteNames
			ORDER BY Company_Name ASC`

		await db.get(sql_CheckViewExists,[],async (err,row)=>{
			if(row){
				db.all(sql_Autocomplete,[],(err,rows) =>{
						if (err) {
							throw err;
						}	
						// console.log(sql_QueryView)
						// console.table(rows)
						return callback(rows)
				})
			}else{
				const filepath_json = './files/db/json/autocomplete_names.json'
				console.log(filepath_json)
				viewresults = await create_View({'sqlCreateView': sql_CreateView,'sqlStoreView': sql_Autocomplete, 'filepath_json': filepath_json})
				console.log(viewresults)
				return callback(viewresults.rows)
			}
		})	
		}catch(err){
			throw err
		}		
	}
// CREATE JSON WITH TOP FILERS
	async function create_View(options,results){
		results ={}
		try{	
			
			await db.run(options.sqlCreateView,[],(err,rows) =>{
				if (err) {
					throw err;
					results.sqlstatus=('Error creating sql view: '+err)
				}	
					results.sqlstatus=('Created SQL View: ')
			
					db.all(options.sqlStoreView,[],(err,rows) =>{
						if(fs.existsSync(options.filepath_json)) {
							return results.warning = ('JSON file already Exists: Not Overwriting... '+options.filepath_json)		
						}
						//MAKE DIR IF IT DOESN'T EXIST YET
						if (!fs.existsSync(path.dirname(options.filepath_json))){
							fs.mkdirSync(path.dirname(options.filepath_json))
						}
						//QUERY DATA TO INSERT
						jsondata = {}
						jsondata['data']=rows
						fs.writeFileSync(options.filepath_json, JSON.stringify(jsondata))

						if(fs.existsSync(options.filepath_json)) {
							results.jsonstatus=('JSON file created'+options.filepath_json)
						}else{
							results.warning=('Error Creating JSON')
						}
					})
			})
			await new Promise((resolve, reject) => setTimeout(resolve, 5000));
			return results

		}catch(err){
			throw err
		}
	}


module.exports = {query_CIK_Filings,query_Autocomplete_Names};