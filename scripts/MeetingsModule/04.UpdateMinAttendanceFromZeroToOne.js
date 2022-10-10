const path = require('path')
const Facilities = require('../../src/v1.0/facilities/facilities.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../../.env') })

let dbUrl = process.env.DB_URL
let dbConnectionParams = { 'useNewUrlParser': true, 'useUnifiedTopology': true, 'useFindAndModify': false, };

async function startDatabase() {
  await mongoose.connect(dbUrl, dbConnectionParams);
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Facilities
  const query = { minMeetingAttendance: "0" }
  const totalCount = await db.aggregate([{ $match: query }, { $count: 'total' }])
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)
  
  const updateCommand = { $set: { minMeetingAttendance: "1" } }
  const result = await db.updateMany(query, updateCommand)
  console.log({result})

  const finalCount = await db.aggregate([{ $match: query }, { $count: 'total' }])
  console.log(`Total found after: ${finalCount && finalCount[0] && finalCount[0].total} (if undefined, all done!)`)

  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}
