# 
# EDGAR_fetch
## Node JS Process to download indexed history from SEC.gov filings, unzip indexes, store in Database, and query for filings.

#### *Created by Yaniv Alfasy*

### Download Git and Requirements

    git clone https://github.com/superyaniv/EDGAR_fetch.git

### Input Data into Data Folders
* Directory files will contain all the files downloaded and unzipped
** /files/zipped_files will contain the zipped files downloaded (master.gz) from the years obtained
** /files/unzipped_files will contain the unzipped files from /files/zipped_files
** /files/db will contain all the index files stored in a sqlite database.

