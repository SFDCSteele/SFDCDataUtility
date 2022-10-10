const path = require('path')
const Facilities = require('../../src/v1.0/facilities/facilities.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const dotenv = require('dotenv');
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

const approvedPositions = ['Activity Director', 'Admin', 'Captain', 'Chaplain', 'Coordinator', 'Director', 'Manager', 'Officer', 'Supervisor', 'Warden' ]

const findAppropriateStaffPosition = (savedPosition) => {
  const position = savedPosition.trim()

  if (position === 'chaplin') {
    return 'Chaplain'
  }

  const approvedPositionIndex = approvedPositions.map((x, i) => {
    if (position.includes(x)) {
      return i
    }
    return -1
  }).filter(x => x !== -1)[0]

  if (approvedPositionIndex) {
    return approvedPositions[approvedPositionIndex]
  }

  const associateDirectors = [
    'VIP Coordinator',
    'Inmate Services Coordinator',
    'Sr. Program Specialist',
    'Programs Department',
    'Director',
  ]

  if (associateDirectors.includes(position)) {
    return approvedPositions[0]
  }

  const admins = [
    'Library',
    'Office Technician',
    'Acting CRM',
    'CRM Assistant',
    'CRM',
    'CRM (For All Conservation Camps)',
    'Human Resources Specialist',
    'Human Resources',
    'Administrator',
    'Facility Contact Asst',
    'Supervisor Volunteer Services',
    'Jail Administrator',
    'Superintendent',
    'Volunteer Services Coordinator',
    'Facility Contact Asst JW',
  ]
  if (admins.includes(position)) {
    return approvedPositions[5]
  }

  const captains = [
    'Captain',
    'Captain Facility Operations Div.',
    'Capt. of Probation Div.',
  ]
  if (captains.includes(position)) {
    return approvedPositions[8]
  }

  const chaplains = [
    'Chaplin',
    'Chaplain',
    'Religious Volunteer',
    'Protestant State Chaplain',
    'Supervisory Chaplain',
    'Support Officer - Religious Services',
    'Facility Chaplain Elmwood',
    'Assistant F. C.',
    'Facility Chaplain',
    'Senior Chaplain',
    'Assistant Chaplain',
    'Senior Chaplain Prison',
    'Senior Staff jail ministry',
    'assistant staff jail ministry',
    'Senior Chaplain -Main',
    'Head Chaplain',
    'Asst Chaplain',
    'Chaplain - SRC Jail',
    'Chaplian',
    'Assistant Chaplin',
    'Reverend',
    'Protestant Chaplain',
  ]
  if (chaplains.includes(position)) {
    return approvedPositions[2]
  }

  const coordinators = [
    'Program Coordinator Reentry Services Division',
    'Sr. Office Asst Inmates Program',
    'Re-Entry Affairs Coordinator',
    'ADA Coordinator',
    'Volunteer Services',
  ]
  if (coordinators.includes(position)) {
    return approvedPositions[8]
  }

  const directors = [
    'Program Director',
    'Executive Director',
  ]
  if (directors.includes(position)) {
    return approvedPositions[1]
  }

  const managers = [
    'Community Resources Manager',
    'Reentry Program Manager',
    'Community Resource Manager',
    'Facility Contact',
    'Facility Contact JW',
    'Facility Outreach Contact JW',
    'Facility Outreach Contact',
    'FOC',
  ]
  if (managers.includes(position)) {
    return approvedPositions[6]
  }

  const officers = [
    'Inmate Services Officer',
    'Commander',
    'Assist Commander',
    'Guard',
    'Programs Officer',
    'Lieutenant',
    'Jail Superintendent',
    'Major',
    'Chief Deputy',
    'Officer in Charge',
    'Camp Commander',
    'Official'
  ]
  if (officers.includes(position)) {
    return approvedPositions[3]
  }

  const supervisors = [
    'Counseling Supervisor',
    'Accreditation Supervisor',
  ]
  if (supervisors.includes(position)) {
    return approvedPositions[9]
  }

  const wardens = [
    'Camp commander',
    'Asst. Camp Commander',
    'Warden',
    'Chief of Corrections',
    'Assistant Warden',
    'Boss Man',
    'Chief',
  ]
  if (wardens.includes(position)) {
    return approvedPositions[4]
  }

  return ''
}

const updateStaff = async (facilityID, staffID, position) => {
  console.log(`Updating { facilityID: '${facilityID}', 'staff._id': ObjectId('${staffID}') } with Position: ${position}`)
  const query = { facilityID: facilityID, 'staff._id': convertStringToObjectId(staffID) }
  const setCommand = {
    $set: {
      'staff.$.staffPosition': position,
    }
  }

  await Facilities.findOneAndUpdate(query, setCommand, { new: true })
  console.log('Finished')
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    for (let k = 0; k < item.staff.length; k++) {
      const staffMember = item.staff[k]
      const position = staffMember.staffPosition
      if (position === '') {
        continue
      }

      const isProperStaffPosition = approvedPositions.includes(position)
      if (isProperStaffPosition) {
        continue
      }

      const appropriatePosition = findAppropriateStaffPosition(position)
      if (appropriatePosition === '') {
        console.log('Position Before/After', { before: position, after: appropriatePosition })
      }

      await updateStaff(item.facilityID, staffMember._id, appropriatePosition)
    }
  }
  return
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Facilities
  const pipeline = [{ $match: { $and: [{ 'staff.0': { $exists: true } }, { 'staff.staffPosition': { $nin: [...approvedPositions, ''] } }] } }]
  const totalCount = await countQuery(db, pipeline)
  console.log(`Total facilities found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true

  // const batch = await getBatch(db, pipeline, skip, limit)
  // await updateBatch(batch);

  while (shouldContinueRunning) {
    // This will get a smaller portion of the documents to operate on
    const batch = await getBatch(db, pipeline, skip, limit)
    // Optional - depending on if your query reduces in size as you query or if it's a fixed number of results that you need to page through
    console.log(batch.length, ' found this time!')
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
  console.log(`Total facilities found after: ${finalCount && finalCount[0] && finalCount[0].total} (if undefined, all done!)`)

  process.exit(0)
}

try {
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}
