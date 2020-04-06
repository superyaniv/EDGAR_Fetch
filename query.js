// query.js

// DECLARE REQUIREMENTS
	const sqlite3 = require('sqlite3').verbose();


// OPEN DATABASE		
	let db = new sqlite3.Database('./db/EDGAR_data.db', (err) => {
	   if (err) {
	    console.error(err.message);
		  }
		  console.log('Connected to the master_indexes database.');
	});

// QUERY THE DATABASE AND AND RETURN PATH
function queryCIK(CIK_Num,callback){
	
		results = []
		let sql = `SELECT *
					FROM master_indexes
					WHERE CIK  = ?`;
	// GET RESULTS
		db.each(sql, [CIK_Num], function(err, row){
			if (err) {
				throw err;
			}
			//console.log(row)
			//results.push(row)
			results.push(row)

		},function(){
			db.close
			return callback(results)
		})
}

module.exports = {queryCIK};