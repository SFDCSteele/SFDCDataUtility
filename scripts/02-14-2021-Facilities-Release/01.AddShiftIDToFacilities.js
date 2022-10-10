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

async function countQuery(db, query) {
  return await db.aggregate([...query, { $count: 'total' }])
}

const convertStringToObjectId = (str) => mongoose.Types.ObjectId(str)

async function queryCollection(db, pipeline) {
  return await db.aggregate(pipeline)
}

const getSome = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const generateUniqueIdentifier = () => {
  const min = 1650000000000
  const max = 1750000000000
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  return num
}

async function updateWithShiftID(facilities) {
  for (let a = 0; a < facilities.length; a++) {
    const facility = facilities[a];
    console.log(`Checking FacilityID: ${facility.facilityID}`)
    for (let b = 0; b < facility.shifts.length; b++) {
      const shiftKeys = Object.keys(facility.shifts[b])
      if (shiftKeys.length > 1 && shiftKeys.indexOf('shiftID') === -1) {
        const identifier = generateUniqueIdentifier()
        console.log(`
  FacilityID: { $match: { facilityID: '${facility.facilityID}' } }
  STARTING to update FacilityID: ${facility.facilityID} ${facility.shifts[b].dayOfWeek} ${facility.shifts[b].shiftName} ${facility.shifts[b].gender} with ShiftID: ${identifier.toString()}
  `)
        const query = { facilityID: facility.facilityID, 'shifts._id': convertStringToObjectId(facility.shifts[b]._id) }
        const setCommand = {
          $set: {
            'shifts.$.shiftID': identifier.toString()
          },
        }
        await Facilities.findOneAndUpdate(query, setCommand, { new: true })
        console.log(`UPDATED FacilityID: ${facility.facilityID} ${facility.shifts[b].dayOfWeek} ${facility.shifts[b].shiftName} ${facility.shifts[b].gender} with ShiftID: ${identifier.toString()}`)
      }
    }
  }
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const facilitiesPipeline = [{ $match: { $and: [{ 'shifts.shiftName': { $exists: true } }, { 'shifts.shiftID': {$exists: false }}]} }]
  const totalFacilityCount = await countQuery(Facilities, facilitiesPipeline)
  console.log(`There are a total of ${totalFacilityCount && totalFacilityCount[0] && totalFacilityCount[0].total} facilities with shifts needing shiftIDs`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true

  while (shouldContinueRunning) {
    const facilities = await getSome(Facilities, [...facilitiesPipeline, { $sort: {facilityID: 1} }], skip, limit)
    shouldContinueRunning = facilities.length > 0

    if(!shouldContinueRunning) {
      console.log('Finished processing all facilities!')
      break;
    }

    await updateWithShiftID(facilities)
  }

  const finalCount = await countQuery(Facilities, facilitiesPipeline)
  console.log(`There are a total of ${finalCount && finalCount[0] && finalCount[0].total} shifts without shiftIDs leftover (if undefined, all done!)`)

  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}


