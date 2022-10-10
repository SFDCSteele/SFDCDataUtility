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

const getUserIDFromEmail = async (email) => {
  const pipeline = [{
    $match: {
      email: email
    }
  }, {
    $project: {
      _id: 0,
      userID: 1
    }
  }]

  const result = await Volunteers.aggregate(pipeline)
  if (result && result[0])
    return result[0].userID

  return null
}

const updateBatch = async (batch) => {
  const processedIDs = []
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    const query = {
      meetingID: item.meetingID
    }
    processedIDs.push(item.meetingID)
    const updatedMeetingParts = await Promise.all(item.meetingParts.map(async x => {
      const userID = Boolean(x.volAssigned) ? await getUserIDFromEmail(x.volAssigned) : null
      return {
        ...x,
        assignedUserID: userID,
      }
    }))

    const setCommand = {
      $set: {
        meetingParts: updatedMeetingParts
      }
    }
    await Meetings.findOneAndUpdate(query, setCommand, { new: true })
  }
  console.log({ processedMeetingIDs: processedIDs })
  return processedIDs
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
          'meetingParts.volAssigned': {
            $exists: true
          }
        },
        {
          'meetingParts.volAssigned': {
            $ne: 'Assigned'
          }
        },
        {
          $or: [
            {
              'meetingParts.assignedUserID': {
                $exists: false
              }
            },
            {
              'meetingParts.assignedUserID': {
                $eq: null
              }
            }
          ]
        }
      ]
    }
  }]
  let alreadyProcessedList = []
  const totalCount = await countQuery(db, pipeline)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true

  // const batch = await getBatch(db, pipeline, skip, limit)
  // await updateBatch(batch);

  while (shouldContinueRunning) {
    // This will get a smaller portion of the documents to operate on
    const freshPipeline = [...pipeline, { $match: { meetingID: { $nin: alreadyProcessedList } } }]
    const batch = await getBatch(db, freshPipeline, skip, limit)
    // Optional - depending on if your query reduces in size as you query or if it's a fixed number of results that you need to page through
    // skip = skip + limit
    shouldContinueRunning = batch.length > 0

    // If the batch was empty, we'll end the process - we're done!
    if (!shouldContinueRunning) {
      console.log('Finished processing all items!')
      break;
    }

    // If we've made it here, there are batch items to update, logic to update the batch of records should be done in this function
    const processedIDs = await updateBatch(batch);
    if (processedIDs && processedIDs.length > 0) {
      alreadyProcessedList = [...alreadyProcessedList, ...processedIDs]
    }
  }

  const finalCount = await countQuery(db, pipeline)
  console.log(`Total found after: ${finalCount && finalCount[0] && finalCount[0].total} (if undefined, all done - if greater than 0, user's with emails attached that are no longer associated to a userID are still on this many meeting parts. Run this to verify:
    [{
      $match: {
        $and: [
          {
            'meetingParts.volAssigned': {
              $exists: true
            }
          },
          {
            $or: [{
              'meetingParts.assignedUserID': {
                $exists: false
              }
            }, {
              'meetingParts.assignedUserID': { $eq: null }
            }]
          }
        ]
      }
    }]
    
    )`)

  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}
