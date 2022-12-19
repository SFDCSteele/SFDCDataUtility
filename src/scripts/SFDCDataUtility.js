const path = require('path')
//const Studies = require('../src/v1.0/study/studies.model')
//const mongoose = require('mongoose').set('debug', true);
//mongoose.promise = Promise;
//const { Pool } = require('pg');
const sql = require('mssql')
const fs = require('fs');
const jsforce = require('jsforce');
const sfbulk = require('node-sf-bulk2');
const util = require('util');

const dotenv = require('dotenv').config()
//dotenv.config({ path: path.join(__dirname, '/.env') })

let dbUrl = process.env.DB_URL
let processConfig/* = new Object ({
  "dbURL": String,
  "dataSources": String,
  "sourceTables": [
    String,
  ],
  "mock": Boolean
})*/
//let dbConnectionParams = { 'useNewUrlParser': true, 'useUnifiedTopology': true, 'useFindAndModify': false, };
// config for your database
const sqlConfig = {
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false // change to true for local dev / self-signed certs
  }
}

sql.on('error', err => {
  console.log('SQL error: ' + err.message)
})

async function startDatabase() {
  try {

    console.log('\n\n inside startDatabase..config: ' + JSON.stringify(sqlConfig))

    // make sure that any items are correctly URL encoded in the connection string
    let pool = await sql.connect(sqlConfig)
    console.log('\n\n inside sql connect...')

    let result = await pool.request().query('select * from accounts')
    console.log('query result: ' + JSON.stringify(result))
  } catch (err) {
    console.log('\n\n startDatabase error: ' + err.message)
    // ... error checks
  }
}

async function countQuery(sql, pipeline) {
  return queryCollection(sql, pipeline)
}

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


const getMock = async (totalRecords) => {
  const fieldNames = ['Name', 'AccountNumber', 'OwnerId', 'AccountSource', 'BillingAddress', 'RecordTypeId', 'Site', 'Description', 'ParentId', 'Industry', 'Type']
  const fieldFiller = ['MOCKED', 'MOCKED', 'DEFAULT', 'MOCKED', 'MOCKED', 'DEFAULT', 'MOCKED', 'DEFAULT', 'MOCKED', 'DEFAULT', 'DEFAULT']
  const fieldDefault = ['&_Account_#', '&#', '00575000001SqTqAAK', '&_Source_#', '# Main Street\nLine2\nLine3', '012750000008axPAAQ', 'Site #', 'Bulk API Upsert', '', 'Transportation', 'Customer']
  const fieldAction = ['QUOTED', 'QUOTED', 'QUOTED', 'QUOTED', 'SKIP', 'QUOTED', 'QUOTED', 'QUOTED', 'SKIP', 'QUOTED', 'QUOTED']

  let rowCount = 1
  let validFields = 0
  let outputBuffer = ''
  let outputField = ''
  let outputLine = ''
  try {
    outputLine = ''

    for (let j = 0; j < fieldAction.length; j++) {
      if (fieldAction[j] != 'SKIP') {
        validFields++
      }
    }
    console.log('>>>>>>>>>>>>>################ valid fields: ' + validFields)
    for (let i = 0, k = 0; i < fieldNames.length; i++) {
      if (fieldAction[i] != 'SKIP') {
        if (++k < validFields) {
          outputLine += '"' + fieldNames[i] + '",'
        } else {
          outputLine += '"' + fieldNames[i] + '"'
        }
      }
    }
    outputLine += '\n'
    outputBuffer += outputLine
    //console.log(''+(rowCount+1)+'-'+outputLine)
    for (rowCount = 0; rowCount < totalRecords; rowCount++) {
      outputLine = ''
      for (let i = 0, k = 0; i < fieldNames.length; i++) {
        outputField = ''
        if (fieldAction[i] !== 'SKIP') {
          if (fieldFiller[i] === 'BLANK') {
            outputField = ''
          } else if (fieldFiller[i] === 'DEFAULT') {
            outputField = fieldDefault[i]
          } else if (fieldFiller[i] === 'MOCKED') {
            outputField = fieldDefault[i]
            outputField = outputField.replaceAll('#', '' + (rowCount + 1))
            outputField = outputField.replaceAll('&', '' + totalRecords)
            //console.log('mocked field: '+outputField)
          }
          if (fieldAction[i] === 'QUOTED') {
            outputField = '\"' + outputField + '\"'
          }
          //console.log(''+(i+1)+'-'+fieldNames[i]+'\t\t=\t'+outputField)
          if (++k < validFields) {
            outputLine += outputField + ','
          } else {
            outputLine += outputField
          }
        }
      }
      outputLine += '\n'
      outputBuffer += outputLine
      //console.log(''+(rowCount+1)+'-'+outputLine)
    }
  } catch (err) {
    console.log('An error occurred: ' + err.message)
  }
  console.log('\n\n...Created ' + totalRecords + ' mock records...')
  return outputBuffer


}

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateBatch = async (bulkrequest, response, data) => {
  const status = await bulkrequest.uploadJobData(response.contentUrl, data)
  return status
}

const loadConfiguration = async () => {
  let rawdata = fs.readFileSync('configuration.json');
  let processConfig = JSON.parse(rawdata);
  return processConfig
}

const run = async () => {
  try {
    processConfig = await loadConfiguration()
  } catch (err) {
    console.log('JSON parse error: ' + err.message)
  }
  //processConfig = JSON.parse(config)
  console.log('\n\n process config loaded: ' + JSON.stringify(processConfig))
  //const mock = processConfig.mock
  console.log('\n\n Run a mock load: ' + processConfig.mock)
  await startDatabase().then(async () => {
    console.log('mssql db connected')
  })

  const db = sql
  const pipeline = 'select count(*) from accounts'
  //const totalCount = await countQuery(db, pipeline)
  //console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true
  let batch = []
  let status

  //let output = await getMock(processConfig.mockRecords)
  //console.log('\n\n mocked data: '+output)

  const runArgs = process.argv.slice(2);
  let runArgsPassed = process.argv.length > 2
  if ( runArgsPassed ) {
    console.log('Processing data load: ', runArgs[0]);
  }

  if (process.env.username && process.env.password ) {
    //if (process.env.username && process.env.password && !shouldContinueRunning) {
    // connect to Salesforce Using JSforce
    const conn = new jsforce.Connection({ loginUrl: process.env.customURL });
    console.log('\n\n...Attempting to login with: \n\n\tUsername: ' + process.env.username + '\n\tPassword: ' + process.env.password + '\n===================')
    await conn.login(process.env.username, process.env.password);
    console.log('\n...Attempting to connect with: \n\n\taccessToken: ' + conn.accessToken + '\n\tinstanceUrl: ' + conn.instanceUrl + '\n===================')
    // create bulk connect object
    const bulkconnect = {
      'accessToken': conn.accessToken,
      'apiVersion': '51.0',
      'instanceUrl': conn.instanceUrl
    };
    try {
      // create a new BulkAPI2 class
      const bulkrequest = new sfbulk.BulkAPI2(bulkconnect);
      console.log('\n...Bulkrequest created: ' + JSON.stringify(bulkrequest))
      let jobRequest = {
        'object': 'Account',
        'operation': 'insert'
      };

      for (const loadRec of processConfig.dataLoads) {

        if (!runArgsPassed || (runArgsPassed && loadRec.dataloadName === runArgs[0])) {
          console.log('\n load record: \n\t dataloadName: ' + loadRec.dataloadName +
            "\n\t sourceSchema: " + loadRec.sourceSchema,
            "\n\t sourceTable: " + loadRec.sourceTable,
            "\n\t SalesforceObject: " + loadRec.SalesforceObject,
            "\n\t operation: " + loadRec.operation,
            "\n\t extractSQL: " + loadRec.extractSQL,
            "\n\t extractWhereClause: " + loadRec.extractWhereClause
          )

          // create a bulk insert job
          jobRequest = {
            'object': loadRec.SalesforceObject,
            'operation': loadRec.operation
          };
          const response = await bulkrequest.createDataUploadJob(jobRequest);
          console.log('\n...JobRequest created: ' + JSON.stringify(response))


          while (shouldContinueRunning) {
            // This will get a smaller portion of the documents to operate on
            if (processConfig.mock) {
              batch = await getMock(processConfig.mockRecords)
            } else {
              batch = await getBatch(db, pipeline, skip, limit)
            }
            // Optional - depending on if your query reduces in size as you query or if it's a fixed number of results that you need to page through
            skip = skip + limit
            shouldContinueRunning = batch.length > 0 && !processConfig.mock


            // If we've made it here, there are batch items to update, logic to update the batch of records should be done in this function
            if (response.id) {
              status = await updateBatch(bulkrequest, response, batch)
              console.log('\n\n...Loaded batch: response.id:  ' + response.id + ' status: ' + status)
            }

            // If the batch was empty, we'll end the process - we're done!
            if (!shouldContinueRunning) {
              console.log('Finished processing all items!')
              if (status === 201) {
                // close the job for processing
                await bulkrequest.closeOrAbortJob(response.id, 'UploadComplete');
                console.log('\n\n...Closed job: status:  ' + status)
                console.log('\n\n\n\nLast batch attempted: \n\n' + batch)
                const failures = await bulkrequest.getResults(response.id, 'failedResults')
                console.log('\n\n\n\nfailures: \n' + failures)
              }
              break;
            }
          }
        }
      }
    } catch (ex) {
      console.log('Catch: ' + ex.message);
    }
  } else {
    throw 'set environment variable with your orgs username and password'
  }


  //const finalCount = await countQuery(db, pipeline)
  //console.log(`Total found after: ${finalCount && finalCount[0] && finalCount[0].total} (if undefined, all done!)`)


  console.log('\n\n################################################################################\n' +
    '...PROCESS COMPLETE...\n\n\n')
  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}
