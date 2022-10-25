# SFDCDataUtility
Utility to read from multiple sources and load data to a SF Org using Bulk API 2.0

# source: https://github.com/endolabs/salesforce-bulkv2-java


# https://www.tutorialsteacher.com/nodejs/access-sql-server-in-nodejs


var express = require('express');
var app = express();

app.get('/', function (req, res) {
   
    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'sa',
        password: 'mypassword',
        server: 'localhost', 
        database: 'SchoolDB' 
    };

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from Student', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset);
            
        });
    });
});

var server = app.listen(5000, function () {
    console.log('Server is running..');
});


# https://learn.microsoft.com/en-us/sql/connect/node-js/node-js-driver-for-sql-server?view=sql-server-ver16
# https://learn.microsoft.com/en-us/sql/connect/node-js/step-3-proof-of-concept-connecting-to-sql-using-node-js?view=sql-server-ver16

# https://github.com/tediousjs/tedious/tree/master/examples
# https://www.youtube.com/watch?v=W3VZt8OkDX0


# Connecting to Salesforce

# https://github.com/msrivastav13/node-sf-bulk2
# https://salesforce.stackexchange.com/questions/329155/create-a-bulk-job-using-jsforce
# https://github.com/msrivastav13/sfmetadataDependency
# https://npm.io/package/node-sf-bulk2
