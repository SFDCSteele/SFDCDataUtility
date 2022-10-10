const path = require('path')
const VolunteerActivities = require('../../src/v1.0/volunteeractivities/volunteeractivities.model')
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

const generateUniqueIdentifier = () => {
  const min = 1650000000000
  const max = 1750000000000
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  return num.toString()
}

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const migrateActivitiesPipeline = [{
  $lookup: {
    from: 'volunteeractivities',
    localField: 'activityID',
    foreignField: 'migrationActivityIDList',
    as: 'va'
  }
}, {
  $match: {
    'va.0': {
      $exists: false
    }
  }
}, {
  $addFields: {
    minutes: {
      $add: [
        {
          $multiply: [
            {
              $convert: {
                input: {
                  $arrayElemAt: [
                    {
                      $split: [
                        '$activityHours',
                        ':'
                      ]
                    },
                    0
                  ]
                },
                to: 'double',
                onError: 0
              }
            },
            60
          ]
        },
        {
          $convert: {
            input: {
              $arrayElemAt: [
                {
                  $split: [
                    '$activityHours',
                    ':'
                  ]
                },
                1
              ]
            },
            to: 'double',
            onError: 0,
            onNull: 0
          }
        }
      ]
    }
  }
}, {
  $addFields: {
    appMinutes: {
      $cond: [
        {
          $eq: [
            '$activityType',
            'app'
          ]
        },
        '$minutes',
        0
      ]
    },
    correspondenceMinutes: {
      $cond: [
        {
          $or: [
            {
              $eq: [
                '$activityType',
                'correspondence'
              ]
            },
            {
              $eq: [
                '$activityType',
                ''
              ]
            }
          ]
        },
        '$minutes',
        0
      ]
    },
    adminMinutes: {
      $cond: [
        {
          $eq: [
            '$activityType',
            'admin'
          ]
        },
        '$minutes',
        0
      ]
    },
    trainingMinutes: {
      $cond: [
        {
          $eq: [
            '$activityType',
            'training'
          ]
        },
        '$minutes',
        0
      ]
    },
    shepherdingMinutes: {
      $cond: [
        {
          $eq: [
            '$activityType',
            'shepherding'
          ]
        },
        '$minutes',
        0
      ]
    },
    visitMinutes: {
      $cond: [
        {
          $eq: [
            '$activityType',
            'visit'
          ]
        },
        '$minutes',
        0
      ]
    },
    meetingMinutes: {
      $cond: [
        {
          $eq: [
            '$activityType',
            'meeting'
          ]
        },
        '$minutes',
        0
      ]
    }
  }
}, {
  $group: {
    _id: {
      userID: '$userID',
      date: '$activityDate',
      region: '$region'
    },
    totalVideos: {
      $sum: '$activityVideos'
    },
    totalPlacements: {
      $sum: '$activityPlacements'
    },
    totalRVs: {
      $sum: '$activityReturnVisits'
    },
    totalStudies: {
      $sum: '$activityBibleStudies'
    },
    totalICLW: {
      $sum: '$activityICLW'
    },
    appMinutes: {
      $sum: '$appMinutes'
    },
    correspondenceMinutes: {
      $sum: '$correspondenceMinutes'
    },
    adminMinutes: {
      $sum: '$adminMinutes'
    },
    trainingMinutes: {
      $sum: '$trainingMinutes'
    },
    shepherdingMinutes: {
      $sum: '$shepherdingMinutes'
    },
    visitMinutes: {
      $sum: '$visitMinutes'
    },
    meetingMinutes: {
      $sum: '$meetingMinutes'
    },
    migrationActivityIDList: {
      $push: '$activityID'
    }
  }
}, {
  $project: {
    _id: 0,
    userID: '$_id.userID',
    date: {
      $dateFromString: {
        dateString: '$_id.date',
        format: '%m-%d-%Y',
        onError: 0,
        onNull: 0
      }
    },
    region: '$_id.region',
    videos: {
      $ifNull: [
        '$totalVideos',
        0
      ]
    },
    placements: {
      $ifNull: [
        '$totalPlacements',
        0
      ]
    },
    returnVisits: {
      $ifNull: [
        '$totalRVs',
        0
      ]
    },
    bibleStudies: {
      $ifNull: [
        '$totalStudies',
        0
      ]
    },
    initialCallLettersWritten: {
      $ifNull: [
        '$totalICLW',
        0
      ]
    },
    appMinutes: 1,
    correspondenceMinutes: 1,
    adminMinutes: 1,
    trainingMinutes: 1,
    shepherdingMinutes: 1,
    meetingMinutes: 1,
    visitMinutes: 1,
    migrationActivityIDList: 1
  }
}]

const updateBatch = async (batch) => {
  const vaBatch = []
  for (let i = 0; i < batch.length; i++) {
    batch[i].volunteerActivityID = generateUniqueIdentifier()
    batch[i].created = new Date().toISOString()
    batch[i].createdBy = 'migration'
    batch[i].modified = new Date().toISOString()
    batch[i].modifiedBy = 'migration'
    console.log('pre', batch[i])
    const va = new VolunteerActivities(batch[i])
    vaBatch.push(va)
    console.log('post', va)
    // await va.save()
  }

  const result = await VolunteerActivities.insertMany(vaBatch)
  console.log(result)
  return result
}

const connectToActivitiesModel = () => {
  const Schema = mongoose.Schema;

  const activitySchema = new Schema({
    activityID: String,
    userID: {
      type: String,
      index: true
    },
    region: String,
    activityDate: String,
    activityType: String,
    activityHours: String,
    activityVideos: Number,
    activityPlacements: Number,
    activityReturnVisits: Number,
    activityBibleStudies: Number
  });

  const Activities = mongoose.model('Activity', activitySchema, 'activities');
  return Activities
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = connectToActivitiesModel()
  const activitiesNotMigratedYet = [{
    $lookup: {
      from: 'volunteeractivities',
      localField: 'activityID',
      foreignField: 'migrationActivityIDList',
      as: 'va'
    }
  }, {
    $match: { 'va.0': { $exists: false } }
  }]
  const totalCount = await countQuery(db, activitiesNotMigratedYet)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 500
  let shouldContinueRunning = true

  // const batch = await getBatch(db, migrateActivitiesPipeline, skip, limit)
  // await updateBatch(batch)

  while (shouldContinueRunning) {
    // This will get a smaller portion of the documents to operate on
    const batch = await getBatch(db, migrateActivitiesPipeline, skip, limit)
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

  const finalCount = await countQuery(db, activitiesNotMigratedYet)
  console.log(`Total found after: ${finalCount && finalCount[0] && finalCount[0].total} (if undefined, all done!) - If any are left over, they are without an activityType`)

  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}


