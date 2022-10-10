const path = require('path')
const Studies = require('../../src/v1.0/study/studies.model')
const Facilities = require('../../src/v1.0/facilities/facilities.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const dotenv = require('dotenv')
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

const getSome = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

async function getStudies(skip, limit) {
  const studiesPipeline = [
    {
      // $match: { facilityID: { $exists: true } }
      $match: { $and: [{ shiftID: {$exists: false }}, {facilityID: {$exists: true}}]}
    },
    {
      $addFields: {
        dayOfWeek: {
          $switch: {
            branches: [
              { case: { $eq: [{ $dayOfWeek: '$date' }, 1] }, then: 'Sunday' },
              { case: { $eq: [{ $dayOfWeek: '$date' }, 2] }, then: 'Monday' },
              { case: { $eq: [{ $dayOfWeek: '$date' }, 3] }, then: 'Tuesday' },
              { case: { $eq: [{ $dayOfWeek: '$date' }, 4] }, then: 'Wednesday' },
              { case: { $eq: [{ $dayOfWeek: '$date' }, 5] }, then: 'Thursday' },
              { case: { $eq: [{ $dayOfWeek: '$date' }, 6] }, then: 'Friday' },
              { case: { $eq: [{ $dayOfWeek: '$date' }, 7] }, then: 'Saturday' }
            ],
            'default': 0
          }
        }
      }
    }, {
      $project: {
        _id: 1,
        studyID: 1,
        facilityID: 1,
        dayOfWeek: 1,
        gender: 1,
        startTime: '$shiftStartTime',
        endTime: '$shiftEndTime',
        shiftName: 1
      }
    }, {
      $sort: {
        _id: 1
      }
    }
  ]

  const someStudies = await getSome(Studies, studiesPipeline, skip, limit)
  return someStudies
}

const getFacility = async (facilityID) => {
  return await Facilities.aggregate([{ $match: { facilityID: facilityID }}])
}

const updateStudyWithShiftID = async (id, shiftID) => {
  console.log(`STARTING to update Study _id ${id} with shiftID ${shiftID}`)
  const query = { _id: convertStringToObjectId(id) }
  const setCommand = {
    $set: {
      'shiftID': shiftID
    },
  }

  const result = await Studies.findOneAndUpdate(query, setCommand, { new: true })
  console.log(`UPDATED studyID ${result.studyID} with shiftID ${result.shiftID}`)
}

const updateStudiesWithShiftIDs = async (studies) => {
  for (let i = 0; i < studies.length; i++) {
    const study = studies[i];
    const facilities = await getFacility(study.facilityID)
    const facility = facilities[0]
    if (!facility || !facility.facilityID) {
      console.log(`WARNING: StudyID ${study.studyID} either did not have a facilityID or did have a facilityID, but there is no matching facility with that ID (it was deleted?)`)
      continue;
    }
    console.log(`Analyzing studyID: ${study.studyID} with facilityID: ${facility.facilityID}`)

    const matchingFacilityShift = facility.shifts.filter(x => {
      const isMatchingShift = x.dayOfWeek === study.dayOfWeek
                              && x.gender === study.gender
                              && x.startTime === study.startTime
                              && x.endTime === study.endTime
                              && x.shiftName === study.shiftName
      if (isMatchingShift) {
          return x
        }
    })

    if (matchingFacilityShift.length === 1) {
      await updateStudyWithShiftID(study._id, matchingFacilityShift[0].shiftID)
    } else if (matchingFacilityShift.length === 0) { 
      console.log(`No matching shift found between facilityID: ${facility.facilityID} and studyID: ${study.studyID}`)
    } else {
      console.log(`More than 1 shift matched between facilityID: ${facility.facilityID} and studyID: ${study.studyID}`)
    }
  }
  return
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const totalCount = await countQuery(Studies, [{ $match: { $and: [{ shiftID: {$exists: false }}, {facilityID: {$exists: true}}]} }])
  console.log(`There are a total of ${totalCount && totalCount[0] && totalCount[0].total} studies`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true

  while (shouldContinueRunning) {
    const studies = await getStudies(skip, limit)
    shouldContinueRunning = studies.length > 0
    skip = skip + limit
    if (!shouldContinueRunning) {
      console.log('Finished processing all studies!')
      break;
    }

    await updateStudiesWithShiftIDs(studies);
  }

  const finalCount = await countQuery(Studies, [{ $match: { $and: [{ shiftID: {$exists: false }}, {facilityID: {$exists: true}}]} }])
  console.log(`There are a total of ${finalCount && finalCount[0] && finalCount[0].total} left over that were not able to find a matching facility shift in order to add a shiftID to the study. (if undefined, all done!)`)

  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}


