# EDGAR Fetch
---

## A Simple Node JS Process to Create your own Index of SEC Filings.
### Retreive all zipped indexes, unzip indexes, store in sqlitedb, and query for filings.

#### *Created by Yaniv Alfasy*

### Purpose: 
- Currently, public SEC filings have more information than almost all private repositories of financial information, but they are poorly stored, indexed, rendered to the public for analysis.

- Although the SEC makes all this information public, and is indeed making steps to better catalog the information, there is no credible public free API to analyze this important data. 

- The hope is to at least index the amount of data, and where it stored, then serve that index, and hope to inspire a future where the data is more easily accessable and analyzable with modern analytics tools.

---
### Download Git and Requirements

    git clone https://github.com/superyaniv/EDGAR_fetch.git

---
### Fetching Data into Data Folders

* Directory files will contain all the files downloaded and unzipped

From Edgarfetch.js:
```javascript
node fetch/fetch
```
* /files/datasets/raw will contain the raw dera datasets (num,pre,etc.)

From Edgarfetch.js:
```javascript
node store/store
```
* /files/datasets/json will contain the json results for each CIK (num and pre having the main data, sub containing company_info)

From Edgarfetch.js:
```javascript 
node merge/merge
```
* Merge the num and pre data to get a superset of both.

---
## EDGAR SERVER
From EDGAR_Server.js is a simple node app that will display the contents of the index files:

* Star the node js server with:
    
        node EDGAR_Server

Server will run on [http://localhost:3000](http://localhost:3000)

Todo:
- [x] Process to download all index files from 1993-2020.
- [x] Process to unzip all index files.
- [x] Process to read and store all index files in database.
- [x] Server to query data and return JSON using Node.
- [x] Create test Site with Node to query Data stored.
- [x] Find header information using stored indexes.
- [x] Download header information (efficiently)
- [x] Faster query and indexing of company filings.
- [ ] Download XBRL information (efficiently)
- [ ] Store XBRL Data
- [ ] Query XBRL
- [ ] Serve XBRL Data
