const path = require('path')
const Inmates = require('../../src/v1.0/inmates/inmates.model')
const mongoose = require('mongoose').set('debug', true);
mongoose.promise = Promise;

const dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname, '../../.env')})

let dbUrl = process.env.DB_URL
let dbConnectionParams = {'useNewUrlParser': true, 'useUnifiedTopology': true}

async function startDatabase() {
    await mongoose.connect(dbUrl, dbConnectionParams);
}

async function countQuery(db, query) {
    return await db.aggregate([...query, {$count: 'total'}])
}

const convertStringToObjectId = (str) => mongoose.Types.ObjectId(str)

async function queryCollection(db, pipeline) {
    return await db.aggregate(pipeline)
}

const getBatch = async (query, skip, limit) => {
    const pipeline = [...query, {$skip: skip ?? 0}, {$limit: limit ?? 20}]
    return queryCollection(Inmates, pipeline)
}

const updateBatch = async (batch) => {
    for (const i in batch) {
        const inmate = batch[i]
        const query = {inmateID: inmate.inmateID}
        const update = {
            'assignedInPerson': 'inPerson' in inmate && inmate.volAssigned !== "" ?
                [{role: 'Primary', userID: inmate.inPerson.userID}] :
                []
        }
        const result = await Inmates.findOneAndUpdate(query, update)
        console.log(result)
    }
}

const run = async () => {
    await startDatabase().then(async () => {})
    const pipeline = [
        {
            $match: {
                assignedInPerson: {$exists: false}
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'volAssigned',
                foreignField: 'username',
                as: 'inPerson'
            }
        },
        {
            $unwind: {
                path: '$inPerson',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                inmateID: 1,
                volAssigned: 1,
                inPerson: 1
            }
        }
    ]
    const skip = 0
    const limit = 100
    do {
        const inmates = await getBatch(pipeline, skip, limit)
        if (inmates.length == 0) {
            break
        }
        await updateBatch(inmates)
    } while (true)
    process.exit(0)
}

try {
    run().then(() => {
    })
} catch (err) {
    console.log(':::PROBLEM ENCOUNTERED WHILE RUNNING SCRIPT:::')
    console.log(err)
    process.exit(0)
}
