const path = require('path')
const Congregations = require('../src/v1.0/congregations/congregations.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const dotenv = require('dotenv');
const { insertMeeting } = require('../src/v1.0/facilities/facilities.meetings.controller');
dotenv.config({ path: path.join(__dirname, '../.env') })

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

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    console.log(''+(i+1)+'-congregationID: '+item.congregationID+'  state: '+item.state+'*')
    const query = { congregationID: item.congregationID }
    let newState = ''
    let executeUpdate = false
    switch (item.state) {
      case 'Florida': {
        newState = 'FL'
        executeUpdate = true
        break
      }
      case ' Florida': {
        newState = 'FL'
        executeUpdate = true
        break
      }
      case ' Fl': {
        newState = 'FL'
        executeUpdate = true
        break
      }
      case 'Fl': {
        newState = 'FL'
        executeUpdate = true
        break
      }
      case 'Ca': {
        newState = 'CA'
        executeUpdate = true
        break
      }
      case 'CA': {
        newState = 'CA'
        executeUpdate = true
        break
      }
      case ' CA': {
        newState = 'CA'
        executeUpdate = true
        break
      }
      case ' CA ': {
        newState = 'CA'
        executeUpdate = true
        break
      }
      case 'ca': {
        newState = 'CA'
        executeUpdate = true
        break
      }
      case 'Georgia': {
        newState = 'GA'
        executeUpdate = true
        break
      }
      case 'ga': {
        newState = 'GA'
        executeUpdate = true
        break
      }
      default:
        executeUpdate = false
        break
    }

    if ( executeUpdate ) {
      const update = { 'congregationAddress.state': newState }
      console.log('preparing to update: ', query, update)

      const result = await Congregations.findOneAndUpdate(query,update)
      console.log(result)
    }

  }
  return
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Congregations
  const pipeline = 
    [{
      $unwind: {
       path: '$congregationAddress',
       preserveNullAndEmptyArrays: true
      }
     }, {
      $match: {
       $and: [
        {
         'congregationAddress.state': {
          $ne: 'FL'
         }
        },
        {
         'congregationAddress.state': {
          $ne: 'CA'
         }
        }
       ]
      }
     }, {
      $project: {
        congregationID: 1,
        congregationAddressID: '$congregationAddress._id',
        state: '$congregationAddress.state'
      }
     }
  ]
  console.log('\n\n pipeline: '+JSON.stringify(pipeline))
  const totalCount = await countQuery(db, pipeline)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true

  while (shouldContinueRunning) {
    // This will get a smaller portion of the documents to operate on
    const batch = await getBatch(db, pipeline, skip, limit)
    //console.log('\n\n batch: '+JSON.stringify(batch))
    // Optional - depending on if your query reduces in size as you query or if it's a fixed number of results that you need to page through
    skip = skip + limit
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
