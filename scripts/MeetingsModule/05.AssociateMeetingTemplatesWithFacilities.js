const path = require('path')
const Meetings = require('../../src/v1.0/meetings/meetings.model')
const MeetingsTemplates = require('../../src/v1.0/meetingtemplates/meetingtemplates.model')
const utilities = require('../../src/utilities')
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

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];

  }
  return
}


const getDiffUpdates = (meetingTemplatesHashes, meetingHashes, totalMeetingTemplates) => {
  let addedFacilities = 0
  let newTemplates = []
  let newTemplate = []//new MeetingsTemplates()
  let newTemplateID = ''
  const foundMeetingTemplates = meetingHashes.map(current => {
    const foundMeetingTemplateIndex = meetingTemplatesHashes.findIndex(x => x.hash === current.hash)
    if (foundMeetingTemplateIndex === -1) {
      return current
    } else if (meetingTemplatesHashes[foundMeetingTemplateIndex]?.hash?.length > 0) {
      const foundActualMeetingTemplateIndex = totalMeetingTemplates.findIndex(x => x.templateID === meetingTemplatesHashes[foundMeetingTemplateIndex].templateID)
      console.log('\n\t### meeting template: ' + foundMeetingTemplateIndex + ' actual meeting template: ' + foundActualMeetingTemplateIndex)
      console.log('\n\t found: ' + current.hash +
        ' (' + current.hash.length + ') ' +
        ' meeting template hash (' + meetingTemplatesHashes[foundMeetingTemplateIndex].hash.length + ') : ' + meetingTemplatesHashes[foundMeetingTemplateIndex].hash +
        '\n\t===> ' + JSON.stringify(current) +
        '\n\t===> ' + JSON.stringify(meetingTemplatesHashes[foundMeetingTemplateIndex]) +
        '\n\t===> ' + JSON.stringify(totalMeetingTemplates[foundActualMeetingTemplateIndex])
      )
      newTemplateID = utilities.randomUniqueIndentifier()
      newTemplate = {
        facilityID: current.facilityID,
        templateID: meetingTemplatesHashes[foundMeetingTemplateIndex].templateID,
        newTemplateID: newTemplateID
      }
      console.log('\n\t NEW TEMPLATE: '+JSON.stringify(newTemplate))
      newTemplates.push(newTemplate)
      addedFacilities++
    }
  }).filter(x => x)

  console.log('\n\n\t\t$$$$$$$$$$ added facility IDs: '+addedFacilities)
  return { newTemplates: newTemplates} //totalMeetingTemplates }
}

const prepareTemplates = (incomingTemplates, newTemplateData) => {
  let newTemplates = []
  let newTemplate = new MeetingsTemplates()
  //const newMeetingTemplates = incomingTemplates
  console.log('\n\nLooping through '+incomingTemplates.length+' of templates...')
  for (let i=0;i < incomingTemplates.length; i++ ) {
    const foundNewTempalteIndex = newTemplateData.findIndex(x => x.templateID === incomingTemplates[i].templateID)
    console.log('\n\t looking for templateID{'+foundNewTempalteIndex+'): '+incomingTemplates[i].templateID)
    if ( foundNewTempalteIndex > -1 ) {
      console.log('\n\t OLD meeting Template ('+foundNewTempalteIndex+'): '+JSON.stringify(incomingTemplates[i]))
      console.log('\n\t data to update template ('+foundNewTempalteIndex+'): '+JSON.stringify(newTemplateData[foundNewTempalteIndex]))
      newTemplate = []
      newTemplate = incomingTemplates[i]
      newTemplate.facilityID = newTemplateData[foundNewTempalteIndex].facilityID
      newTemplate.templateID = newTemplateData[foundNewTempalteIndex].newTemplateID//utilities.randomUniqueIndentifier()
      console.log('\n\t NEW meeting Template: '+JSON.stringify(newTemplate))
      newTemplates.push(newTemplate)
    }
  }

  return { newTemplates }
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected: ' + dbUrl)
  })

  const db = MeetingsTemplates
  const pipeline = [{
    $match: {
      meetingParts: {
        $elemMatch: {
          $and: [
            {
              mtgType: {
                $ne: null
              }
            }
          ]
        }
      }
    }
  }, { $project: { _id: 0}}]

  const totalCount = await countQuery(db, pipeline)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)
  const totalMeetingTemplates = await queryCollection(db, pipeline)
  console.log('\n\n Meeting templates count: ' + JSON.stringify(totalMeetingTemplates))

  let skip = 0
  const limit = 2
  let shouldContinueRunning = true

  while (shouldContinueRunning) {
    //   // This will get a smaller portion of the documents to operate on
    const meetingTemplatesHashes = await getMeetingTemplateHashes()
    const meetingHashes = await getMeetingHashes()
    console.log('\n\n Meeting templates count: ' + meetingTemplatesHashes.length + ' meetings: ' + meetingHashes.length)
    console.log('\n meeting templates: ' + JSON.stringify(meetingTemplatesHashes))
    console.log('\n meetings: ' + JSON.stringify(meetingHashes))
    const diffs = await getDiffUpdates(meetingTemplatesHashes, meetingHashes, totalMeetingTemplates)
    console.log('\n diffs (' + diffs.newTemplates.length + '): ' + JSON.stringify(diffs))
    const newlyGeneratedTemplates = await prepareTemplates(totalMeetingTemplates,diffs.newTemplates)
    console.log('\n newlyGeneratedTemplates (' + newlyGeneratedTemplates.newTemplates.length + '): ' + JSON.stringify(newlyGeneratedTemplates))

    //const newMeetingTemplates = await mergeTemplates(totalMeetingTemplates,meetingHashes)
    //console.log('\n NEW meeting templates: '+JSON.stringify(newMeetingTemplates))

    //   const batch = await getBatch(db, pipeline, skip, limit)

    //   shouldContinueRunning = batch.length > 0

    //   // If the batch was empty, we'll end the process - we're done!
    //   if (!shouldContinueRunning) {
    //     console.log('Finished processing all items!')
    //     break;
    //   }

    //   // If we've made it here, there are batch items to update, logic to update the batch of records should be done in this function
    //   await updateBatch(batch);
    const result = await MeetingsTemplates.insertMany(newlyGeneratedTemplates.newTemplates)

    shouldContinueRunning = false
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

const getMeetingTemplateHashes = async () => {
  const pipeline = [{
    $match: {
      "templateID": { $exists: true }
    }
  }, {
    $addFields: {
      meetingPartsForHash: '$meetingParts.mtgType'
    }
  }, {
    $unwind: {
      path: '$meetingParts'
    }
  }, {
    $group: {
      _id: {
        templateID: '$templateID',
        creator: '$creator',
        region: '$region',
        templateName: '$templateName'
      },
      parts: {
        $addToSet: {
          $concat: [
            '$meetingParts.mtgType', '->',
            '$meetingParts.mtgTypeDetail'
          ]
        }
      }
    }
  }, {
    $addFields: {
      hash: {
        $reduce: {
          input: '$parts',
          initialValue: '',
          'in': {
            $concat: [
              '$$value',
              ',',
              '$$this'
            ]
          }
        }
      }
    }
  }, {
    $project: {
      templateID: '$_id.templateID',
      facilityID: 1,
      hash: 1
    }
  }
  ]
  const result = await queryCollection(MeetingsTemplates, pipeline)
  return result
}

const getMeetingHashes = async () => {
  const pipeline = [{
    $addFields: {
      meetingPartsForHash: '$meetingParts.mtgType'
    }
  }, {
    $unwind: {
      path: '$meetingParts'
    }
  }, {
    $group: {
      _id: {
        meetingID: '$meetingID',
        facilityID: '$facilityID',
        region: '$region',
      },
      parts: {
        $addToSet: {
          $concat: [
            '$meetingParts.mtgType', '->',
            '$meetingParts.mtgTypeDetail'
          ]
        }
      }
    }
  }, {
    $addFields: {
      hash: {
        $reduce: {
          input: '$parts',
          initialValue: '',
          'in': {
            $concat: [
              '$$value',
              ',',
              '$$this'
            ]
          }
        }
      },
      facilityIDs: {
        $reduce: {
          input: '$facilityIDHash',
          initialValue: '',
          'in': {
            $cond: {
              'if': { $eq: ['$$value', ''] },
              then: '$$this',
              'else': { $concat: ['$$value', ',', '$$this'] }
            }
          }
        }
      }
    }
  }, {
    $project: {
      meetingID: '$_id.meetingID',
      facilityID: '$_id.facilityID',
      hash: 1
    }
  }, { $sort: { hash: 1, facilityID: 1 } }
  ]
  const result = await queryCollection(Meetings, pipeline)
  return result
}

// Get all meetings, 