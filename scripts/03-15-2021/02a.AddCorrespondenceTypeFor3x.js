const path = require('path')
const Correspondences = require('../../src/v1.0/correspondence/correspondences.model')
const mongoose = require('mongoose').set('debug', true)
mongoose.promise = Promise

const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../../.env') })

const dbUrl = process.env.DB_URL
const dbConnectionParams = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }

const convertStringToObjectId = (str) => mongoose.Types.ObjectId(str)

async function startDatabase () {
  await mongoose.connect(dbUrl, dbConnectionParams)
}

async function countQuery (db, query) {
  return await db.aggregate([...query, { $count: 'total' }])
}

async function queryCollection (db, pipeline) {
  return await db.aggregate(pipeline)
}

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i]
    const query = { correspondenceID: item.correspondenceID, _id: convertStringToObjectId(item._id) }
    const setCommand = { $set: { correspondenceType: 'Paper' } }
    console.log(query, setCommand)

    const result = await Correspondences.findOneAndUpdate(query, setCommand, { new: true })
    console.log(result)
  }
  return 'FINISHED'
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Correspondences
  const pipeline = [{
    $addFields: {
      dblCorrespondenceID: { $toDouble: '$correspondenceID' }
    }
  }, {
    $match: {
      $and: [{
          dblCorrespondenceID: { $lt: 1647026670541 }
        }, {
          correspondenceType: null
        }
      ]
    }
  }, {
    $project: {
      _id: 1,
      correspondenceID: 1,
      correspondenceDate: 1
    }
  }]
  const totalCount = await countQuery(db, pipeline)
  let total = totalCount && totalCount[0] && totalCount[0].total
  console.log(`Total found before: ${total ?? 0}`)

  const skip = 0
  const limit = 1000 // TODO: Change to 1000 - there are 54000+ in production of these
  let shouldContinueRunning = true

  // const batch = await getBatch(db, pipeline, skip, limit)
  // await updateBatch(batch)

  while (shouldContinueRunning) {
    console.log(`${total} left to go!`)
    // This will get a smaller portion of the documents to operate on
    const batch = await getBatch(db, pipeline, skip, limit)
    shouldContinueRunning = batch.length > 0

    // If the batch was empty, we'll end the process - we're done!
    if (!shouldContinueRunning) {
      console.log('Finished processing all items!')
      break
    }

    // If we've made it here, there are batch items to update, logic to update the batch of records should be done in this function
    await updateBatch(batch)
    total = total - limit
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
