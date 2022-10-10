const path = require('path')
const Correspondences = require('../../src/v1.0/correspondence/correspondences.model')
const mongoose = require('mongoose').set('debug', true)
mongoose.promise = Promise

const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../../.env') })

const dbUrl = process.env.DB_URL
const dbConnectionParams = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }

async function startDatabase () {
  await mongoose.connect(dbUrl, dbConnectionParams)
}

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Correspondences
  console.log('Removing all correspondenceNotes fields...')
  console.log('==========================================')
  console.log('THIS IS A DESTRUCTIVE SCRIPT - IT REMOVES correspondenceNotes FROM correspondence DOCUMENTS')
  console.log('IF THIS WAS UNINTENTIONAL, PRESS CTRL+C NOW TO EXIT THE PROCESS. YOU HAVE TEN (10) SECONDS...')

  await snooze(10000)

  await db.updateMany({}, { $unset: { correspondenceNotes: 1 } })

  console.log('Removed all correspondenceNotes fields from correspondence documents.')
  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}
