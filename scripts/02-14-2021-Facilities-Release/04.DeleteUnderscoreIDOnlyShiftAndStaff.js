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

const removeStaffIdOnly = async (facilityID, staffIDToRemove) => {
  return await Facilities.updateOne(
    { facilityID: facilityID, 'staff._id': convertStringToObjectId(staffIDToRemove) },
    { $pull: { staff: { _id: convertStringToObjectId(staffIDToRemove) } } }
  )
}

const removeShiftIdOnly = async (facilityID, shiftIDToRemove) => {
  return await Facilities.updateOne(
    { facilityID: facilityID, 'shifts._id': convertStringToObjectId(shiftIDToRemove) },
    { $pull: { shifts: { _id: convertStringToObjectId(shiftIDToRemove) } } }
  )
}

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];

    if (item.staff) {
      console.log(`This facility ${item.facilityID} has ${item.staff.length} staff members`)
      for (let j = 0; j < item.staff.length; j++) {
        if (Object.keys(item.staff[j]).length === 1) {
          console.log('Removing: ', { facilityID: item.facilityID, staffUnderscoreID: item.staff[j]._id })
          await removeStaffIdOnly(item.facilityID, item.staff[j]._id)
        }
      }
    }

    if (item.shifts) {
      console.log(`This facility ${item.facilityID} has ${item.shifts.length} shifts`)
      for (let k = 0; k < item.shifts.length; k++) {
        if (Object.keys(item.shifts[k]).length === 1) {
          console.log('Removing: ', { facilityID: item.facilityID, shiftUnderscoreID: item.shifts[k]._id })
          await removeShiftIdOnly(item.facilityID, item.shifts[k]._id)
        }
      }
    }
  }

  return
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Facilities
  const pipeline = [{
    $match: {
      $or: [{
        $and: [
          { 'shifts.0._id': { $exists: true } },
          { 'shifts.0.shiftName': { $exists: false } }
        ]
      }, {
        $and: [
          { 'staff.0._id': { $exists: true } },
          { 'staff.0.staffName': { $exists: false } }
        ]
      }]
    }
  }]
  const totalCount = await countQuery(db, pipeline)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true

  while (shouldContinueRunning) {
    const batch = await getBatch(db, pipeline, skip, limit)
    shouldContinueRunning = batch.length > 0

    if (!shouldContinueRunning) {
      console.log('Finished processing all items!')
      break;
    }

    await updateBatch(batch);
  }

  const finalCount = await countQuery(db, pipeline)
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
