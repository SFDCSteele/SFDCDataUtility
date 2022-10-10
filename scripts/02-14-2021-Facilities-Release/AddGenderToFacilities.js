const path = require('path')
const Facilities = require('../../src/v1.0/facilities/facilities.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const doIt = process.argv[2] && process.argv[2] == '--yesdoit' ? true : false

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

async function addGenderField(facilities) {
  for (let a = 0; a < facilities.length; a++) {
    const facility = facilities[a];
    if (facility.gender != null) {
      console.log(`Setting ${facility.locationName}; FacilityID: ${facility.facilityID} to ${facility.gender}`)
      if (doIt) {
        await Facilities.findOneAndUpdate({ facilityID: facility.facilityID }, { $set: { gender: facility.gender } }, { new: true })
      }
    }
  }
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const facilitiesPipeline = [{ $match: { gender: { $exists: false } } }]
  const totalFacilityCount = await countQuery(Facilities, facilitiesPipeline)
  console.log(`There are a total of ${totalFacilityCount[0].total} facilities without gender defined`)

  const facilities = await Facilities.aggregate()
    .match({ gender: { $exists: false } })
    .addFields({
      gender: {
        $reduce: {
          input: '$shifts',
          initialValue: null,
          in: {
            $cond: {
              if: {
                $eq: ['$$value', 'Both']
              },
              then: 'Both',
              else: {
                $cond: {
                  if: {
                    $or: [
                      { $and: [
                        { $eq: ['$$value', 'Male']},
                        { $eq: ['$$this.gender', 'Female']}
                      ]},
                      { $and: [
                        { $eq: ['$$value', 'Female']},
                        { $eq: ['$$this.gender', 'Male']}
                      ]}
                    ]
                  },
                  then: 'Both',
                  else: {
                    $cond: {
                      if: { $eq: ['$$this.gender', 'Male']},
                      then: 'Male',
                      else: {
                        $cond: {
                          if: { $eq: ['$$this.gender', 'Female']},
                          then: 'Female',
                          else: null
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    .project({ _id: 0, facilityID: 1, locationName: 1, gender: 1 })

  await addGenderField(facilities)

  process.exit(0)
}

try {
  if (doIt) {
    console.log('Actually adding gender field')
  } else {
    console.log('Dry run. To actually add the field, add --yesdoit to the command')
  }
  run()
} catch (err) {
  console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
  console.log(err)
  process.exit(0)
}