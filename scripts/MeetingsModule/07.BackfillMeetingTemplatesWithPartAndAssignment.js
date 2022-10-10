const path = require('path')
const MeetingTemplates = require('../../src/v1.0/meetingtemplates/meetingtemplates.model')
const MeetingParts = require('../../src/v1.0/meetingparts/meetingparts.model')
const MeetingAssignments = require('../../src/v1.0/meetingassignments/meetingassignments.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const migrateAssignmentsToBeParts = {}
const directMigrationToNewNameAssignments = {}
const primeMeetingAssignmentDictionary = async () => {
  const starterAssignmentsDictionary = {
    "Live Outline": { newAssignmentName: "Conductor" },
    "Conductor": { newAssignmentName: "Conductor" },
    "What can the Bible Teach Us": { newAssignmentName: "Conductor" },
    "Watchtower Conductor": { newAssignmentName: "Conductor" },
    "Good News Brochure": { newAssignmentName: "Student" },
    "Video Outline": { newAssignmentName: "Conductor" },
    "Watchtower Reader": { newAssignmentName: "Reader" },
    "Public Talk": { newAssignmentName: "Conductor" },
    "Who are Doing Jehovahs Will": { newAssignmentName: "Conductor" },
    "Reader": { newAssignmentName: "Reader" },
    "Congregation Bible Study Conductor": { newAssignmentName: "Conductor" },
    "Watchtower Conductor Detail Name": { newAssignmentName: "Conductor" },
    "Watchtower Reader Detail Name": { newAssignmentName: "Reader" },
    "MEETINGDETAIL1": { newAssignmentName: "Reader" },
  }

  for (let assignmentName in starterAssignmentsDictionary) {
    const assignment = starterAssignmentsDictionary[assignmentName]
    const foundSystemMeetingAssignment = await MeetingAssignments.findOne({ assignment: assignment.newAssignmentName, facilityID: null })
    directMigrationToNewNameAssignments[assignmentName] = {
      newAssignmentName: assignment.newAssignmentName,
      newAssignmentID: foundSystemMeetingAssignment.meetingAssignmentID,
    }
  }

  const assignmentParts = {
    "Close": { newAssignmentName: null, newPartName: "Prayer - Closing" },
    "Open": { newAssignmentName: null, newPartName: "Prayer - Opening" },
    "Closing Prayer": { newAssignmentName: null, newPartName: "Prayer - Closing" },
    "Closing prayer": { newAssignmentName: null, newPartName: "Prayer - Closing" },
    "Opening prayer": { newAssignmentName: null, newPartName: "Prayer - Opening" },
    "Opening Prayer": { newAssignmentName: null, newPartName: "Prayer - Opening" },
    "Regional Convention Friday": { newAssignmentName: "Conductor", newPartName: "Regional Convention" }
  }

  for (let assignmentName in assignmentParts) {
    const assignmentPart = assignmentParts[assignmentName]
    const foundSystemMeetingPart = await MeetingParts.findOne({ part: assignmentPart.newPartName, facilityID: null })

    const foundSystemMeetingAssignment = assignmentPart.newAssignmentName ? await MeetingAssignments.findOne({ assignment: assignmentPart.newAssignmentName, facilityID: null }) : null
    migrateAssignmentsToBeParts[assignmentName] = {
      newPartName: foundSystemMeetingPart.part,
      newPartID: foundSystemMeetingPart.meetingPartID,
      newAssignmentName: foundSystemMeetingAssignment?.assignment,
      newAssignmentID: foundSystemMeetingAssignment?.meetingAssignmentID,
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
    "Close": { newAssignmentName: null, newPartName: "Prayer - Closing" },
    "Open": { newAssignmentName: null, newPartName: "Prayer - Opening" },
    "Closing Prayer": { newAssignmentName: null, newPartName: "Prayer - Closing" },
    "Opening prayer": { newAssignmentName: null, newPartName: "Prayer - Opening" },
    "Opening Prayer": { newAssignmentName: null, newPartName: "Prayer - Opening" },
    'Opening': { newPartName: 'Prayer - Opening' },
    "Reader": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Reader",
    }
  }
  const starterPartsDictionary = {
    "Public Talk Outline": { newPartName: "Public Talk" },
    "Spiritual Gems": { newPartName: "Spiritual Gems" },
    "Gems": { newPartName: "Spiritual Gems" },
    "memorial talk": { newPartName: "Memorial Talk" },
    "Watchtower Study": { newPartName: "Watchtower Study" },
    "Living As Christians": { newPartName: "Living As Christians" },
    "Living as Christians (Discussion Part)": { newPartName: "Living As Christians" },
    "Living as Christians  (Discussion Part)": { newPartName: "Living As Christians" },
    "Spiritual Encouragement": { newPartName: "Local Needs" },
    "Spiritual Encouragement ": { newPartName: "Local Needs" },
    "Student Demo (Bible Study)": { newPartName: "Bible Study" },
    "Digging for Spiritual Gems": { newPartName: "Spiritual Gems" },
    "Digging for gems": { newPartName: "Spiritual Gems" },
    "Digging for Gems": { newPartName: "Spiritual Gems" },
    "Public Talk": { newPartName: "Public Talk" },
    "Public Discourse Saturday Chowchilla Jail": { newPartName: "Public Talk" },
    "Public Discourse": { newPartName: "Public Talk" },
    "spiritual encouragement": { newPartName: "Local Needs" },
    "Bible Reading": { newPartName: "Bible Reading" },
    "Treasures (10 minute opening talk)": { newPartName: "Treasures from God's Word Talk" },
    "Treasures": { newPartName: "Treasures from God's Word Talk" },
    "Treasures From Gods Word": { newPartName: "Treasures from God's Word Talk" },
    "Student Demo (Return Visit)": { newPartName: "Return Visit" },
    "Assemblies and Conventions": { newPartName: "Regional Convention" },
    "Apply Yourself to the Field Ministry": { newPartName: "Initial Call" },
    "Watchtower study": { newPartName: "Watchtower Study" },
    "Congregation Bible Study": { newPartName: "Congregation Bible Study" },
    "Group Bible Study": { newPartName: "Bible Study" },
    "Watchtower": { newPartName: "Watchtower Study" },
    "Watchtower ": { newPartName: "Watchtower Study" },
    "Watchtower Study Saturday Chowchilla Jail": { newPartName: "Watchtower Study" },
    "Midweek Meeting": { newPartName: "Treasures from God's Word Talk" },
    "Living as Christians (Talk)": { newPartName: "Treasures from God's Word Talk" },
    "Chairman": { newPartName: "Chairman" },
    "Life and Ministry": { newPartName: "Treasures from God's Word Talk" },
    "spiritual encouragement ": {
      newPartName: "Local Needs"
    },
    "Written review ": {
      newPartName: "Local Needs"
    },
    "Theocratic Feature Length Movie": {
      newPartName: "Video"
    },
    "2021 Regional Convention DVD": {
      newPartName: "Regional Convention",
    },
    "JW Broadcast DVD": {
      newPartName: "Video",
    },
    "AV Operator": {
      newPartName: "Audio-Video",
    },
    "Watchtower Study Meeting Part Name": {
      newPartName: "Watchtower Study"
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
    "Treasures from God’s Word": {
      newPartName: "Treasures from God's Word Talk",
    },
  }

  const partsWithAssignmentsStarter = {
    "Regional Convention Friday": { newAssignmentName: "Conductor", newPartName: "Regional Convention" },
    "CBS Reader": { 
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Reader"
    },
    "WT Reader": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Reader",
    },
    "Reader - Congregation Bible Study": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Reader"
    },
    "Bible Study": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Conductor"
    },
    "ASL SAFETY COURSE": { newPartName: "Public Talk", newAssignmentName: "Conductor" },
    "CONGREGATION BIBLE STUDY ASL": { newPartName: "Public Talk", newAssignmentName: "Conductor" },
    "ASL Translator": { newPartName: "Public Talk", newAssignmentName: "Conductor" },
    "Safety Meeting": { newPartName: "Public Talk", newAssignmentName: "Conductor" },
    "Watchtower Conductor": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor"
    },
    "conductor": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor"
    },
    "Special Talk": {
      newPartName: "Public Talk",
      newAssignmentName: "Conductor",
    },
    "Speaker": {
      newPartName: "Public Talk",
      newAssignmentName: "Conductor",
    },
    "Public Discourse": {
      newPartName: "Public Talk",
      newAssignmentName: "Conductor",
    },
    "02 JMW Sunday Test Public Talk": {
      newPartName: "Public Talk",
      newAssignmentName: "Conductor",
    },
    "conductor": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor"
    },
    "03 JMW Sunday Test WT Conductor": {
      newPartName: "Watchtower Study",
      newAssignmentName: "Conductor"
    },
    "AudioVideo": {
      newPartName: "Audio-Video",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "Test 1": {
      newPartName: "Initial Call",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "05 JMW Sunday Test Closing Prayer": {
      newPartName: "Prayer - Closing",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "01 JMW Sunday Test Opening Prayer": {
      newPartName: "Prayer - Opening",
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
    "04 JMW Sunday Test WT Reader": {
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
    "Closing Prayer": {
      newPartName: "Prayer - Closing",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "Treasures from God's Word": { 
      newPartName: "Treasures from God's Word Talk",
      newAssignmentName: null,
      newAssignmentID: null,
    },
    "Public Talk": {
      newPartName: "Public Talk",
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
    "CBS Reader ": {
      newPartName: "Congregation Bible Study",
      newAssignmentName: "Reader",
    },
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
    mtgTypeDetail: isFound.newAssignmentName,
    assignment: isFound.newAssignmentName,
    assignmentID: isFound.newAssignmentID
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
    const templateID = item.templateID;

    if (item.meetingParts && item.meetingParts.length > 0) {
      console.log(`BEFORE - For templateID: ${templateID}`, JSON.stringify(item.meetingParts))
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
      // console.log(`AFTER - For templateID: ${templateID}`, JSON.stringify(item.meetingParts))
      
      const query = { templateID: templateID }
      const update = { $set: { meetingParts: item.meetingParts } }
      const result = await MeetingTemplates.findOneAndUpdate(query, update, {new: true})
      console.log(`AFTER - For templateID: ${templateID}`, JSON.stringify(result.meetingParts))
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

  const db = MeetingTemplates
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
