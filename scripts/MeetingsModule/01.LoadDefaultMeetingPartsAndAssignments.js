const path = require('path')
const Facilities = require('../../src/v1.0/facilities/facilities.model')
const MeetingParts = require('../../src/v1.0/meetingparts/meetingparts.model')
const MeetingAssignments = require('../../src/v1.0/meetingassignments/meetingassignments.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../../.env') })

let dbUrl = process.env.DB_URL
let dbConnectionParams = { 'useNewUrlParser': true, 'useUnifiedTopology': true, 'useFindAndModify': false, };

async function startDatabase() {
  await mongoose.connect(dbUrl, dbConnectionParams);
}

const defaultAssignmentNames = [
  'Assistant',
  'Conductor',
  'Householder',
  'Reader',
  'Student',
]

const defaultPartNames = [
  'Attendant',
  'Audio-Video',
  'Bible Reading',
  'Bible Study',
  'Broadcast',
  'Chairman',
  'Circuit Assembly',
  'Congregation Bible Study',
  'Initial Call',
  'Living As Christians',
  'Local Needs',
  'Memorial Talk',
  'Public Talk',
  'Prayer - Closing',
  'Prayer - Opening',
  'Regional Convention',
  'Return Visit',
  'Spiritual Gems',
  'Student Talk',
  'Treasures from God\'s Word Talk',
  'Video',
  'Watchtower Study',
]

const generateUniqueIdentifier = () => {
  const min = 1650000000000
  const max = 1750000000000
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  return num.toString()
}

const getRegions = async () => {
  const regionPipeline = [{
    $group: {
      _id: null,
      regions: {
        $addToSet: '$region'
      }
    }
  }]

  const regions = await Facilities.aggregate(regionPipeline)
  console.log(`Found ${regions.length} regions`)
  return regions
}

const run = async () => {
  await startDatabase()
  const allRegions = await getRegions()

  console.log(allRegions)
  const runTime = new Date().toISOString()
  const defaultParts = defaultPartNames.map(part => {
    return {
      meetingPartID: `${generateUniqueIdentifier()}`,
      facilityID: null,
      regions: allRegions[0].regions,
      part: part,
      createdByUserID: 'system',
      createdOn: runTime,
      modifiedByUserID: 'system',
      modifiedOn: runTime,
    }
  })

  const defaultAssignments = defaultAssignmentNames.map(asmt => {
    return {
      meetingAssignmentID: `${generateUniqueIdentifier()}`,
      // defaultForBranchID: String, // only for system default assignments
      facilityID: null, // only for custom assignments // null when system 
      regions: allRegions[0].regions,
      assignment: asmt,
      createdByUserID: 'system',
      createdOn: runTime,
      modifiedByUserID: 'system',
      modifiedOn: runTime,
    }
  })

  console.log(JSON.stringify(defaultParts))
  console.log('=====')
  console.log(JSON.stringify(defaultAssignments))

  await MeetingParts.insertMany(defaultParts)
  await MeetingAssignments.insertMany(defaultAssignments)

  process.exit(0)
}

run()