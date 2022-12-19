const path = require('path')
//const Studies = require('../src/v1.0/study/studies.model')
//const mongoose = require('mongoose').set('debug', true);
//mongoose.promise = Promise;
//const { Pool } = require('pg');
var sql = require("mssql");

const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '/.env') })

let dbUrl = process.env.DB_URL
//let dbConnectionParams = { 'useNewUrlParser': true, 'useUnifiedTopology': true, 'useFindAndModify': false, };
// config for your database
var config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE
};

function startDatabase() {
  //await mongoose.connect(dbUrl, dbConnectionParams);
  // connect to your database
  //  console.log('mssql db connected')
  console.log('\n\n inside startDatabase...')

  try {
    sql.connect(config, function (err) {
      console.log('\n\n inside sql connect...')

      if (err) console.log(err);

      // create Request object
      var request = new sql.Request();

      // query to the database and get the records
      request.query('select * from accounts', function (err, recordset) {

        if (err) console.log(err)

        // send records as a response
        res.send(recordset);

      })
    })
  } catch (err) {
    console.error("startDatabase Error " + err);
  }
  return sql
}

async function countQuery(sql, pipeline) {
  return queryCollection(sql, pipeline)
}

const convertStringToObjectId = (str) => mongoose.Types.ObjectId(str)

async function queryCollection(sql, pipeline) {

  // create Request object
  var request = new sql.Request()

  // query to the database and get the records
  request.query(pipeline, function (err, recordset) {

    if (err) console.log(err)
    console.log('\n\n query database: ' + JSON.stringify(recordset))

    // send records as a response
    return recordset

  })

}

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];

  }
  return
}

function run() {
  sql = startDatabase()

  const db = sql
  const pipeline = 'select count(*) from accounts'
  const totalCount = countQuery(db, pipeline)
  console.log(`Total found before: ` + JSON.stringify(totalCount))

  let skip = 0
  const limit = 20
  let shouldContinueRunning = false //true

  while (shouldContinueRunning) {
    // This will get a smaller portion of the documents to operate on
    //const batch = await getBatch(db, pipeline, skip, limit)
    // Optional - depending on if your query reduces in size as you query or if it's a fixed number of results that you need to page through
    skip = skip + limit
    shouldContinueRunning = batch.length > 0

    // If the batch was empty, we'll end the process - we're done!
    if (!shouldContinueRunning) {
      console.log('Finished processing all items!')
      break;
    }

    // If we've made it here, there are batch items to update, logic to update the batch of records should be done in this function
    //await updateBatch(batch);
  }

  //const finalCount = await countQuery(db, pipeline)
  //console.log(`Total found after: ${finalCount && finalCount[0] && finalCount[0].total} (if undefined, all done!)`)

  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}
