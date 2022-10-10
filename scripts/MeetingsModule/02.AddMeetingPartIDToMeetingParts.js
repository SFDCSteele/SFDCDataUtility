const path = require('path')
const Meetings = require('../../src/v1.0/meetings/meetings.model')
const Volunteers = require('../../src/v1.0/volunteers/volunteers.model')
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

const generateUniqueIdentifier = () => {
  const min = 1650000000000
  const max = 1750000000000
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  return num.toString()
}

async function queryCollection(db, pipeline) {
  return await db.aggregate(pipeline)
}

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    console.log({ item })
    const query = {
      meetingID: item.meetingID
    }
    const updatedMeetingParts = item.meetingParts.map(x => {
      return {
        meetingPartID: generateUniqueIdentifier(),
        ...x,
      }
    })

    const setCommand = {
      $set: {
        meetingParts: updatedMeetingParts
      }
    }
    const result = await Meetings.findOneAndUpdate(query, setCommand, { new: true })
  }
  return
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Meetings
  const pipeline = [{
    $match: {
      $and: [
        {
          'meetingParts.meetingPartID': {
            $exists: false
          }
        },
        {
          'meetingParts.mtgType': {
            $exists: true
          }
        }
      ]
    }
  }]
  const totalCount = await countQuery(db, pipeline)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 100
  let shouldContinueRunning = true

  // const batch = await getBatch(db, pipeline, skip, limit)
  // await updateBatch(batch);

  while (shouldContinueRunning) {
    // This will get a smaller portion of the documents to operate on
    const batch = await getBatch(db, pipeline, skip, limit)
    // Optional - depending on if your query reduces in size as you query or if it's a fixed number of results that you need to page through
    // skip = skip + limit
    shouldContinueRunning = batch.length > 0

    // If the batch was empty, we'll end the process - we're done!
    if (!shouldContinueRunning) {
      console.log('Finished processing all items!')
      break;
    }

    // If we've made it here, there are batch items to update, logic to update the batch of records should be done in this function
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
