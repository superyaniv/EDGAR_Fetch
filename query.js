// query.js
// Query the Index database for filing index store information.

// DECLARE REQUIREMENTS
	const sqlite3 = require('sqlite3').verbose();

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
	function query_CIK_Filings(CIK_Num,start_date,end_date,limit,callback){
			
			let sql = `
				SELECT * FROM master_indexes 
				WHERE CIK = '${CIK_Num}' 
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

// QUERY THE DATABASE AND AND RETURN ALL INFO
	function query_TopRecentFilers(callback){
		
			results = []

		//Find all filers with 10Ks in the last 18 months as top filers
			let sql_RecentFilers2Yrs = 
				`SELECT DISTINCT(Company_Name),* 
				FROM master_indexes 
				WHERE 
				(Julianday('now') - JulianDay(Date_Filed)) < 540
				AND 
				Form_Type = '10-K' 
				GROUP BY Company_Name`;		
		//Check if View Exists	
			let sql_CheckViewExists = 
				`SELECT name 
				FROM sqlite_master 
				WHERE type='view' AND name='autoCompleteNames';`
		//Create new view with top filers
			let sql_CreateView = 
				`CREATE VIEW IF NOT EXISTS autoCompleteNames AS ${sql_RecentFilers2Yrs};`
		//Query all names for autocomplete
			let sql_QueryView = 
				`SELECT * 
				FROM autoCompleteNames 
				ORDER BY Company_Name ASC`
			
			
			db.get(sql_CheckViewExists,[],(err,row)=>{
				if(row){
					db.all(sql_QueryView,[],(err,rows) =>{
							if (err) {
								throw err;
							}	
							console.table(rows)
							return callback(rows)
					})
				}else{
					db.run(sql_CreateView,[],(err) =>{
									if (err) {
										throw err;
									}	
							console.table('Created View')
					})
				}
			})	
				
	}

module.exports = {query_CIK_Filings,query_TopRecentFilers};