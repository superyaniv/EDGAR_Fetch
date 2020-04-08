# EDGAR Fetch
## EDGAR Fetch is a Node JS Process to download indexed history from SEC.gov filings.
### Retreive all zipped indexes, unzip indexes, store in sqlitedb, and query for filings.

#### *Created by Yaniv Alfasy*

---
### Download Git and Requirements

    git clone https://github.com/superyaniv/EDGAR_fetch.git

---
### Fetching Data into Data Folders
* Directory files will contain all the files downloaded and unzipped

From Edgarfetch.js:
```javascript
getIndexes(years,quarters)
```
* /files/zipped_files will contain the zipped files downloaded (master.gz) from the years obtained

From Edgarfetch.js:
```javascript
unzipIndexes(years,quarters) 
```
* /files/unzipped_files will contain the unzipped files from /files/zipped_files

From Edgarfetch.js:
```javascript 
storeIndexes(years,quarters) 
```
* /files/db will contain all the index files stored in a sqlite database.

---
## EDGAR SERVER
From EDGAR_Server.js is a simple node app that will display the contents of the index files:

* Star the node js server with:
    
        Node EDGAR_Server.js

Server will run on [http://localhost:3000](http://localhost:3000)

Todo:
[ ] Download header information. 
[ ] Effiecient way to get and store XBRL
[ ] Query XBRL
