// query.js
// Query the Index database for filing index store information.

// DECLARE REQUIREMENTS
	const sqlite3 = require('sqlite3').verbose();


// OPEN DATABASE		
	let db = new sqlite3.Database('./files/db/EDGAR_data.db', (err) => {
	   if (err) {
	    console.error(err.message);
		  }
		  console.log('Connected to the master_indexes database.');
	});

// QUERY THE DATABASE AND AND RETURN ALL INFO
	function queryCIK(start_date='2020-01-01',end_date='2020-12-31',CIK_Num,limit=1000,callback){
		
			results = []
			let sql = `SELECT * FROM master_indexes WHERE CIK  = '${CIK_Num}' AND Date_Filed BETWEEN date('${start_date}') AND date('${end_date}') LIMIT ${limit}`;
			
			console.log(sql)
			
			db.all(sql,[], (err, rows)=>{
				if (err) {
					throw err;
				}
			
				console.table(rows)
				return callback(rows)
			})

	}

// QUERY THE DATABASE AND AND RETURN ALL INFO
	function queryNamesCIK(start_date,end_date,Form_Type,limit,callback){
		
			results = []

			let sqlqueryview = `SELECT * FROM autoCompleteNames`
			let sqlquerynames = `SELECT DISTINCT(Company_Name),CIK FROM master_indexes WHERE (Date_Filed BETWEEN date('${start_date}') AND date('${end_date}')) AND Form_Type = '10-K' LIMIT ${limit}`;			
			let sqlcreateview = `CREATE TEMP VIEW IF NOT EXISTS autoCompleteNames AS ${sqlquerynames};`
			
			db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='master_indexes';`,[],(err,row)=>{
				if(row){
					db.all(sqlqueryview,[],(err,rows) =>{
							if (err) {
								throw err;
							}	
							console.table(rows)
							return callback(rows)
					})
				}else{
					db.run(sqlcreateview,[],(err) =>{
									if (err) {
										throw err;
									}	
									console.table('Created View')
					})
				}
			})	
				
	}


module.exports = {queryCIK,queryNamesCIK};