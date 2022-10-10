const path = require('path')
const Meetings = require('../../src/v1.0/meetings/meetings.model')
const MeetingParts = require('../../src/v1.0/meetingparts/meetingparts.model')
const MeetingAssignments = require('../../src/v1.0/meetingassignments/meetingassignments.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const migrateAssignmentsToBeParts = {}
const directMigrationToNewNameAssignments = {}
const primeMeetingAssignmentDictionary = async () => {
  const starterAssignmentsDictionary = {
    'Reader': { newAssignmentName: 'Reader' },
    'Watchtower Reader': { newAssignmentName: 'Reader' },
    'Watchtower Conductor': { newAssignmentName: 'Conductor' },
    'Initial Call': { newAssignmentName: 'Student' },
    'Assistant': { newAssignmentName: 'Assistant' },
    'Public Talk': { newAssignmentName: 'Conductor' },
    '5 minutes': { newAssignmentName: 'Student' },
    'Live Outline': { newAssignmentName: 'Conductor' },
    'Circuit Assembly Branch Representative': { newAssignmentName: 'Conductor' },
    'Circuit Assembly Circuit Overseer': { newAssignmentName: 'Conductor' },
    'Watchtower': { newAssignmentName: 'Conductor' },
    'Student': { newAssignmentName: 'Student' },
    'Conductor': { newAssignmentName: 'Conductor' },
    'Student Talk': { newAssignmentName: 'Student' },
    'What can the Bible Teach Us': { newAssignmentName: 'Conductor' },
    'Who are Doing Jehovahs Will': { newAssignmentName: 'Conductor' },
    'Video Outline': { newAssignmentName: 'Conductor' },
    'LFF': { newAssignmentName: 'Student' },
    'Watchtower Reader Detail Name': { newAssignmentName: 'Reader' },
    'Watchtower Conductor Detail Name': { newAssignmentName: 'Conductor' },
    'John ': { newAssignmentName: 'Conductor' }
  }

  for (let assignmentName in starterAssignmentsDictionary) {
    const assignment = starterAssignmentsDictionary[assignmentName]
    const foundSystemMeetingAssignment = await MeetingAssignments.findOne({ assignment: assignment.newAssignmentName, facilityID: null })
    directMigrationToNewNameAssignments[assignmentName] = {
      newAssignmentName: assignment.newAssignmentName,
      newAssignmentID: foundSystemMeetingAssignment.meetingAssignmentID,
    }
  }

  const assignmentParts = [
    'Prayer - Opening',
    'Prayer - Closing',
    'Video',
    'Local Needs'
  ]

  for (let i = 0; i < assignmentParts.length; i++) {
    const assignmentPart = assignmentParts[i]
    const foundSystemMeetingAssignment = await MeetingParts.findOne({ part: assignmentPart, facilityID: null })
    migrateAssignmentsToBeParts[assignmentPart] = {
      newPartName: foundSystemMeetingAssignment.part,
      newPartID: foundSystemMeetingAssignment.meetingPartID,
    }
  }
}

const deleteAssignmentList = {
  'undefined': true, // 'bug? find and delete?',
  'Select Meeting Detail': true, // 'bug? find and delete?',
  '': true, // 'bug? find and delete?',
}

const migratePartToPartWithAssignment = {}
const migrateAssignmentToPartDictionary = {}
const directMigrationToNewNameParts = {}
const primeMeetingPartDictionary = async () => {
  const migrateAssignmentToPartList = {
    'Opening Prayer': { newPartName: 'Prayer - Opening' },
    'Open': { newPartName: 'Prayer - Opening' },
    'Close': { newPartName: 'Prayer - Closing' },
    'Opening': { newPartName: 'Prayer - Opening' },
    'February': { newPartName: 'Video' },
    'October': { newPartName: 'Video' },
    'July': { newPartName: 'Video' },
    'April': { newPartName: 'Video' },
  }
  const starterPartsDictionary = {
    "information and updates": {
      newPartName: "Local Needs"
    },
    "Theocratic Feature Length Movie": {
      newPartName: "Video"
    },
    "Local Needs": {
      newPartName: "Local Needs",
    },
    "spiritual encouragement": {
      newPartName: "Local Needs",
    },
    "Return Visit Video": {
      newPartName: "Return Visit",
    },
    "Bible Reading": {
      newPartName: "Bible Reading",
    },
    "Spiritual Encouragement": {
      newPartName: "Local Needs",
    },
    "Student Demo (Return Visit)": {
      newPartName: "Return Visit",
    },
    "Living as Christians (Discussion Part)": {
      newPartName: "Living As Christians",
    },
    "Living as Christians  (Discussion Part)": {
      newPartName: "Living As Christians",
    },
    "spiritual encouragement ": {
      newPartName: "Local Needs"
    },
    "Spiritual Encouragement ": {
      newPartName: "Local Needs"
    },
    "Written review ": {
      newPartName: "Local Needs"
    },
    "CBS Reader ": {
      newPartName: "Congregation Bible Study",
    },
    "Digging for Spiritual Gems": {
      newPartName: "Spiritual Gems",
    },
    "Digging for gems": {
      newPartName: "Spiritual Gems",
    },
    "Treasures (10 minute opening talk)": {
      newPartName: "Treasures from God's Word Talk",
    },
    "Student Demo (Bible Study)": {
      newPartName: "Bible Study",
    },
    "CBS Reader": {
      newPartName: "Congregation Bible Study",
    },
    "Living As Christians": {
      newPartName: "Living As Christians",
    },
    "Reader - Congregation Bible Study": {
      newPartName: "Congregation Bible Study",
    },
    "Student Talk": {
      newPartName: "Student Talk",
    },
    "Increase Your Joy in the Ministry": {
      newPartName: "Video",
    },
    "Video Operator": {
      newPartName: "Audio-Video",
    },
    "Public Talk Outline": {
      newPartName: "Public Talk",
    },
    "Monthly Broadcast": {
      newPartName: "Broadcast",
    },
    "memorial talk": {
      newPartName: "Memorial Talk",
    },
    "Spiritual Gems": {
      newPartName: "Spiritual Gems",
    },
    "Organizational Accomplishments": {
      newPartName: "Video",
    },
    "A/V Operator": {
      newPartName: "Audio-Video",
    },
    "Living as Christians (Talk)": {
      newPartName: "Living As Christians",
    },
    "Chairman": {
      newPartName: "Chairman",
    },
    "Apply Yourself to the Field Ministry": {
      newPartName: "Initial Call",
    },
    "Audio video Operator": {
      newPartName: "Audio-Video",
    },
    "Assemblies and Conventions": {
      newPartName: "Regional Convention",
    },
    "2021 Regional Convention DVD": {
      newPartName: "Regional Convention",
    },
    "Group Bible Study": {
      newPartName: "Bible Study",
    },
    "Memorial Talk": {
      newPartName: "Memorial Talk",
    },
    "Student Demo (Initial Call)": {
      newPartName: "Initial Call",
    },
    "A:V": {
      newPartName: "Audio-Video",
    },
    "Watchtower Study": {
      newPartName: "Watchtower Study",
    },
    "Watchtower ": {
      newPartName: "Watchtower Study",
    },
    "Watchtower": {
      newPartName: "Watchtower Study",
    },
    "Watchtower study": {
      newPartName: "Watchtower Study",
    },
    "JW Broadcast DVD": {
      newPartName: "Video",
    },
    "AV Operator": {
      newPartName: "Audio-Video",
    },
    "Wt Study": {
      newPartName: "Watchtower Study",
    },
    "Conductor": {
      newPartName: "Watchtower Study"
    },
    "Reader": {
      newPartName: "Watchtower Study"
    },
    "WT": {
      newPartName: "Watchtower Study"
    },
    "Midweek: Chairman": {
      newPartName: "Chairman",
    },
    "Midweek: Apply Yourself to the Field Ministry": {
      newPartName: "Initial Call",
    },
    "Bible Study": {
      newPartName: "Congregation Bible Study"
    },
    "Watchtower Study Meeting Part Name": {
      newPartName: 'Watchtower Study'
    },
    "Midweek:  Bible Reading": {
      newPartName: "Bible Reading",
    },
    "Living As Christians: Congregation Bible Study": {
      newPartName: "Congregation Bible Study",
    },
    "Digging For Gems": {
      newPartName: "Spiritual Gems",
    },
    "Midweek: Treasures From God's Word": {
      newPartName: "Treasures from God's Word Talk",
    },
    "Treaures From Gods Word": {
      newPartName: "Treasures from God's Word Talk",
    },
  }

  const partsWithAssignmentsStarter = {
    "WT Reader": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Reader",
    },
    "Special Talk": {
      newPartName: "Public Talk",
      newAssignmentName: "Conductor",
    },
    "Public Discourse": {
      newPartName: "Public Talk",
      newAssignmentName: "Conductor",
    },
    "conductor": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor"
    },
    "Test 1": {
      newPartName: "Initial Call",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "WebEx WT Study": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor",
    },
    "Watchtower (Reader)": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Reader",
    },
    "Watchtower Reader": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Reader",
    },
    "Living as Christians": {
      newPartName: "Living As Christians",
      newAssignmentName: "Conductor",
    },
    "Watchtower Study: Reader": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Reader",
    },
    "Watchtower (Conductor)": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor",
    },
    "Watchtower: Conductor": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor",
    },
    "Reader - Congregation Bible Study": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Reader"
    },
    "Enjoy Life Forever! - An Interactive Bible Study Course": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Conductor"
    },
    "Watchtower Conductor": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor"
    },
    "Closing Prayer": {
      newPartName: "Prayer - Closing",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "Public Talk": {
      newPartName: "Public Talk",
      newAssignmentName: "Conductor",
    },
    "Congregation Bible Study": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Conductor",
    },
    "Opening Prayer": {
      newPartName: "Prayer - Opening",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "Prayer": {
      newPartName: "Prayer - Opening",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "Treasures From Gods Word": {
      newPartName: "Treasures from God's Word Talk",
      newAssignmentName: "Conductor",
    },
    "Treasures": {
      newPartName: "Treasures from God's Word Talk",
      newAssignmentName: "Conductor",
    },
    "Reader": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Reader",
    }
  }

  for (let key in partsWithAssignmentsStarter) {
    const partWithAssignment = partsWithAssignmentsStarter[key]
    const foundSystemMeetingPart = await MeetingParts.findOne({ part: partWithAssignment.newPartName, facilityID: null })

    const foundSystemMeetingAssignment = partWithAssignment.newAssignmentName ? await MeetingAssignments.findOne({ assignment: partWithAssignment.newAssignmentName, facilityID: null }) : null
    migratePartToPartWithAssignment[key] = {
      newPartName: partWithAssignment.newPartName,
      newPartID: foundSystemMeetingPart.meetingPartID,
      newAssignmentName: partWithAssignment.newAssignmentName,
      newAssignmentID: foundSystemMeetingAssignment?.meetingAssignmentID ?? null,
    }

  }

  for (let key in starterPartsDictionary) {
    const meetingPart = starterPartsDictionary[key]
    const foundSystemMeetingPart = await MeetingParts.findOne({ part: meetingPart.newPartName, facilityID: null })
    directMigrationToNewNameParts[key] = {
      ...meetingPart,
      newPartID: foundSystemMeetingPart.meetingPartID
    }
  }

  for (let key in migrateAssignmentToPartList) {
    const migrateAssignmentToPart = migrateAssignmentToPartList[key]
    const foundSystemMeetingPart = await MeetingParts.findOne({ part: migrateAssignmentToPart.newPartName, facilityID: null })
    migrateAssignmentToPartDictionary[key] = {
      ...migrateAssignmentToPart,
      newPartID: foundSystemMeetingPart.meetingPartID
    }
  }
}

const deletePartList = {
  "Select Meeting Part": true,
}

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

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  return queryCollection(db, pipeline)
}

const tryMigrateAssignmentToPart = meetingPart => {

  // migrateAssignmentToPartDictionary
  const isFound = migrateAssignmentToPartDictionary[meetingPart.mtgTypeDetail]

  meetingPart = isFound ? {
    ...meetingPart,
    mtgType: isFound.newPartName,
    part: isFound.newPartName,
    partID: isFound.newPartID,
    mtgTypeDetail: null,
    assignment: null,
    assignmentID: null,
  } : false

  return meetingPart
}

const tryMigratePartToPartWithAssignment = meetingPart => {
  // migratePartToPartWithAssignment
  const isFound = migratePartToPartWithAssignment[meetingPart.mtgType]

  meetingPart = isFound ? {
    ...meetingPart,
    mtgType: isFound.newPartName,
    part: isFound.newPartName,
    partID: isFound.newPartID,
    mtgTypeDetail: isFound.newAssignmentName,
    assignment: isFound.newAssignmentName,
    assignmentID: isFound.newAssignmentID
  } : false

  return meetingPart
}

const tryMigrateAssignmentsToBeParts = meetingPart => {
  // migrateAssignmentsToBeParts
  const isFound = migrateAssignmentsToBeParts[meetingPart.mtgTypeDetail]

  meetingPart = isFound ? {
    ...meetingPart,
    mtgType: isFound.newPartName,
    part: isFound.newPartName,
    partID: isFound.newPartID,
    mtgTypeDetail: null,
    assignment: null,
    assignmentID: null
  } : false

  return meetingPart
}

const tryDirectMigrationToNewNameAssignments = meetingPart => {
  //directMigrationToNewNameAssignments
  const isFound = directMigrationToNewNameAssignments[meetingPart.mtgTypeDetail]

  meetingPart = isFound ? {
    ...meetingPart,
    mtgTypeDetail: isFound.newAssignmentName,
    assignment: isFound.newAssignmentName,
    assignmentID: isFound.newAssignmentID
  } : false

  return meetingPart
}

const tryDirectMigrationToNewNameParts = meetingPart => {
  //directMigrationToNewNameParts
  const isFound = directMigrationToNewNameParts[meetingPart.mtgType]

  meetingPart = isFound ? {
    ...meetingPart,
    mtgType: isFound.newPartName,
    part: isFound.newPartName,
    partID: isFound.newPartID,
  } : false

  return meetingPart
}

const tryHandleSpecialCaseParts = meetingPart => {
  // deletePartList
  const isFound = deletePartList[meetingPart.mtgType]

  meetingPart = isFound ? {
    ...meetingPart,
    mtgType: null,
  } : false

  return meetingPart
}

const tryHandleSpecialCaseAssignments = meetingPart => {
    // deleteAssignmentList
    const isFound = deleteAssignmentList[meetingPart.mtgTypeDetail]
    meetingPart = isFound ? {
      ...meetingPart,
      mtgTypeDetail: null,
    } : false
  
    return meetingPart
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    const meetingID = item.meetingID;

    if (item.meetingParts && item.meetingParts.length > 0) {
      console.log(`BEFORE - For meetingID: ${meetingID}`, JSON.stringify(item.meetingParts))
      for (let j = 0; j < item.meetingParts.length; j++) {
        let meetingPart = item.meetingParts[j];
        console.log('BEFORE', item.meetingParts[j])

        const handleSpecialCasePartsAttempt = tryHandleSpecialCaseParts(meetingPart)
        if (handleSpecialCasePartsAttempt) {
          console.log('UPDATED FROM SPECIAL PARTS')
          item.meetingParts[j] = handleSpecialCasePartsAttempt
          meetingPart = item.meetingParts[j]
        }
        //tryHandleSpecialCaseAssignments
        const handleSpecialCaseAssignmentsAttempt = tryHandleSpecialCaseAssignments(meetingPart)
        if (handleSpecialCaseAssignmentsAttempt) {
          console.log('UPDATED FROM SPECIAL ASSIGNMENTS')
          item.meetingParts[j] = handleSpecialCaseAssignmentsAttempt
          meetingPart = item.meetingParts[j]
        }

        const directMigrationToPartAttempt = tryDirectMigrationToNewNameParts(meetingPart)
        if (directMigrationToPartAttempt) {
          console.log('UPDATED FROM 1')
          item.meetingParts[j] = directMigrationToPartAttempt
          meetingPart = item.meetingParts[j]
        }

        const directMigrationToAssignmentAttempt = tryDirectMigrationToNewNameAssignments(meetingPart)
        if (directMigrationToAssignmentAttempt) {
          console.log('UPDATED FROM 2')
          item.meetingParts[j] = directMigrationToAssignmentAttempt
          meetingPart = item.meetingParts[j]
        }

        const migrationAssignmentsToBePartsAttempt = tryMigrateAssignmentsToBeParts(meetingPart)
        if (migrationAssignmentsToBePartsAttempt) {
          console.log('UPDATED FROM 3')
          item.meetingParts[j] = migrationAssignmentsToBePartsAttempt
          meetingPart = item.meetingParts[j]
        }

        const migratePartToPartWithAssignmentAttempt = tryMigratePartToPartWithAssignment(meetingPart)
        if (migratePartToPartWithAssignmentAttempt) {
          console.log('UPDATED FROM 4')
          item.meetingParts[j] = migratePartToPartWithAssignmentAttempt
          meetingPart = item.meetingParts[j]
        }

        const migrateAssignmentToPartAttempt = tryMigrateAssignmentToPart(meetingPart)
        if (migrateAssignmentToPartAttempt) {
          console.log('UPDATED FROM 5')
          item.meetingParts[j] = migrateAssignmentToPartAttempt
          meetingPart = item.meetingParts[j]
        }

        console.log('AFTER', item.meetingParts[j])
      }

      // Once done, update meeting with new meetingParts
      // console.log(`AFTER - For meetingID: ${meetingID}`, JSON.stringify(item.meetingParts))
      
      const query = { meetingID: meetingID }
      const update = { $set: { meetingParts: item.meetingParts } }
      const result = await Meetings.findOneAndUpdate(query, update, {new: true})
      console.log(`AFTER - For meetingID: ${meetingID}`, JSON.stringify(result.meetingParts))
    }
  }
  return
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  await primeMeetingPartDictionary()
  await primeMeetingAssignmentDictionary()
  console.log({ migrateAssignmentsToBeParts })
  console.log({ directMigrationToNewNameAssignments })
  console.log({ migratePartToPartWithAssignment })
  console.log({ migrateAssignmentToPartDictionary })
  console.log({ directMigrationToNewNameParts })

  const db = Meetings
  const pipeline = [{
    $match: {
      meetingParts: {
        $elemMatch: {
          $and: [
            {
              mtgType: {
                $ne: null
              }
            },
            {
              partID: {
                $eq: null
              }
            },
            {
              mtgType: {
                $ne: 'Attendee'
              }
            }
          ]
        }
      }
    }
  }]

  const totalCount = await countQuery(db, pipeline)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 200
  let shouldContinueRunning = true

  // const batch = await getBatch(db, pipeline, skip, limit)
  // await updateBatch(batch);

  while (shouldContinueRunning) {
    // This will get a smaller portion of the documents to operate on
    const batch = await getBatch(db, pipeline, skip, limit)

    shouldContinueRunning = batch.length > 0
    // skip = skip + limit //TODO: Comment this when partIDs are actually being added
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
