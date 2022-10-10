const path = require('path')
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

const getBatch = async (db, query, skip, limit) => {
  const pipeline = [...query, { $skip: skip ?? 1 }, { $limit: limit ?? 20 }]
  console.log(JSON.stringify(pipeline))
  return queryCollection(db, pipeline)
}

const updateStaff = async (facilityID, staffID, firstName, lastName) => {
  const query = { facilityID: facilityID, 'staff._id': convertStringToObjectId(staffID) }
  const setCommand = {
    $set: {
      'staff.$.staffFirstName': firstName,
      'staff.$.staffLastName': lastName
    }
  }

  return await Facilities.findOneAndUpdate(query, setCommand, { new: true })
}

const updateDualEntry = async (facilityID, staff, names) => {
  const entryOne = names[0]
  const entryTwo = names[1]
  const fixQuery = { facilityID: facilityID, 'staff._id': convertStringToObjectId(staff._id) }
  const fixSetCommand = {
    $set: {
      'staff.$.staffName': `${entryOne.firstName} ${entryOne.lastName}`,
      'staff.$.staffFirstName': entryOne.firstName,
      'staff.$.staffLastName': entryOne.lastName
    }
  }
  const pushQuery = { facilityID: facilityID }
  const pushCommand = {
    $push: {
      staff: {
        staffName: `${entryTwo.firstName} ${entryTwo.lastName}`,
        staffFirstName: entryTwo.firstName,
        staffLastName: entryTwo.lastName,
        staffPosition: staff.staffPosition,
        staffPhone: staff.staffPhone,
        staffEmail: staff.staffEmail, 
      }
    }
  }

  await Facilities.findOneAndUpdate(fixQuery, fixSetCommand, { new: true })
  await Facilities.findOneAndUpdate(pushQuery, pushCommand, { new: true })
  console.log('Special fix applied to facilityID:', facilityID)
  return
}

const updateBatch = async (batch) => {
  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    console.log(`Starting to fix facilityID: ${item.facilityID}`)
    for (let j = 0; j < item.staff.length; j++) {
      const staff = item.staff[j]
      const name = findFirstAndLastName(staff.staffName)
      if (Array.isArray(name)) {
        await updateDualEntry(item.facilityID, staff, name)
      }

      await updateStaff(item.facilityID, staff._id, name.firstName, name.lastName)
      console.log(`Updated { facilityID: ${item.facilityID}, 'staff._id': ${staff._id} } (FIRST: ${name.firstName} LAST: ${name.lastName})`)
    }
  }
  return
}

const findFirstAndLastName = (name) => {
  const nameSections = name.trim().split(' ')
  switch (nameSections.length) {
    case 1: {
      return { firstName: name, lastName: '' }
    }
    case 2: {
      if (name.indexOf(',') > -1) {
        return { firstName: nameSections[1], lastName: nameSections[0].slice(0, -1) }
      }
      return { firstName: nameSections[0], lastName: nameSections[1] }
    }
    case 3: {
      const hasCommaSeparatedName = nameSections[0].indexOf(',') > -1
      if (hasCommaSeparatedName) {
        return { firstName: `${nameSections[1]} ${nameSections[2]}`, lastName: `${nameSections[0].slice(0, -1)}` }
      }

      const hasPrefixOrMiddleInitial = nameSections[0].indexOf('.') > -1 || nameSections[1].indexOf('.') > -1 || nameSections[1].length === 1
      if (hasPrefixOrMiddleInitial) {
        return { firstName: `${nameSections[0]} ${nameSections[1]}`, lastName: `${nameSections[2]}` }
      }

      const hasDutchOriginOrSuffix = nameSections[1].toLowerCase() === 'van' || nameSections[2] === 'Jr.' || nameSections[2] === 'Sr.' || nameSections[2] === 'JIO'
      if (hasDutchOriginOrSuffix) {
        return { firstName: `${nameSections[0]}`, lastName: `${nameSections[1]} ${nameSections[2]}` }
      }

      const isTBA = name.trim().toLowerCase() === 'to be announced' || name.trim().toLowerCase() === 'to be annoucned'
      if (isTBA) {
        return { firstName: 'Tobe', lastName: 'Announced' }
      }
      break;
    }
    case 4: {
      if (name.indexOf('de la') > -1) {
        return { firstName: `${nameSections[0]}`, lastName: `${nameSections[1]} ${nameSections[2]} ${nameSections[3]}` }
      }

      if (name.indexOf('Sgt.') > -1) {
        return { firstName: `${nameSections[0]} ${nameSections[1]} ${nameSections[2]}`, lastName: `${nameSections[3]}` }
      }

      break;
    }
    case 5: {
      if (name.indexOf('Ph.D') > -1) {
        return { firstName: `${nameSections[0]} ${nameSections[1]} ${nameSections[2]}`, lastName: `${nameSections[3]} ${nameSections[4]}` }
      }

      if (name.indexOf('/') > -1) {
        const twoNames = name.split('/')
        const firstName = findFirstAndLastName(twoNames[0])
        const secondName = findFirstAndLastName(twoNames[1])

        return [firstName, secondName]
      }

      break;
    }
    default:
      break;
  }
  return
}

const run = async () => {
  await startDatabase().then(async () => {
    console.log('mongo db connected')
  })

  const db = Facilities
  const pipeline = [{ $match: { $and: [{ 'staff.staffName': { $exists: true } }, { $or: [{ 'staff.staffFirstName': { $exists: false } }, { 'staff.staffLastName': { $exists: false } }] }] } }]
  const totalCount = await countQuery(db, pipeline)
  console.log(`Total found before: ${totalCount && totalCount[0] && totalCount[0].total}`)

  let skip = 0
  const limit = 20
  let shouldContinueRunning = true

  while (shouldContinueRunning) {
    const batch = await getBatch(db, pipeline, skip, limit)
    shouldContinueRunning = batch.length > 0

    if (!shouldContinueRunning) {
      console.log('Finished processing all items!')
      break;
    }

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

const sampleDevStaff = ["Demo Test",
  "Demo Demo",
  "demo demo",
  "Test Test",
  "Chris Wynn",
  "lala lalalala",
  "lala lalalala",
  "Nathan Hogenshak",
  "Nelly Nelson",
  "Nelly Nelson",
  "Teddy Bear",
  "Teddy Bear",
  "Teddy Bear",
  "Ken Wilson",
  "Rick Sloan",
  "Francisco Quinteros",
  "Dan Reichel",
  "Christopher Bailey",
  "Chris Wynn",
  "Misses Rogers",
  "boss hogg",
  "Priz Enwarden",
  "Shana Jerry",
  "namby pamby",
  "Vincent",
  "jay bird",
  "jay bird",
  "jay bird",
  "Bridget Wright",
  "Jackie Stoud",
  "Rebecca Cardenas",
  "Donna Dannemiller",
  "test test",
  "LAST FIRST",
  "Joe Mine",
  "James Keffer",
  "Ken Wilson",
  "Ronald McDonald",
  "Mickey Mouse",
  "Stanley Guardaro",
  "Priscilla Pantaloons",
  "Syed R. Ahmed",
  "Jackson Williams Jr.",
  "Jesus Sillas",
  "Ed Mcclenahan",
  "Rebecca Cardenas",
  "Deborah Postel",
  "Buddy Balagia",
  "Andrew Hyer",
  "Chief Laura E. Bedard, Ph.D",
  "Sgt. Amy R. Lawshe",
  "Alexandra Hopkins",
  "Capt. Latisha Howard",
  "Terry-Luz Cruz",
  "Capt. Kip Beacham",
  "test",
  "Francisco Quinteros",
  "Dan Reichel",
  "Mattimus Scottius",
  "Mattimus Scottius",
  "first last",
  "first last",
  "first last",
  "John Warden",
  "Francisco Quinteros",
  "Dan Reichel",
  "Mattimus Scottius",
  "Mattimus Scottius",
  "first last",
  "first last",
  "first last",
  "Harry Smithson",
  "Milton Pennyman",
  "bobby smith",
  "hanna howard",
  "mister warden",
  "hammy hampton",
  "boss person",
  "Joy Buffington",
  "Me MEME",]

const sampleStaff = ["Shana Jerry",
  "Alex Lam",
  "Bradford Smith",
  "Guillermo Dutra",
  "Keena Allen",
  "Christopher Todd",
  "Jonathan Sorrick",
  "Jeffrey Thompson",
  "Christina Frost",
  "Rebecca Cardenas",
  "Deborah Postel",
  "Alex Ramirez",
  "Susan",
  "Alex Ramirez",
  "Susan",
  "Renee Hankla",
  "Ken Phillips",
  "Adriana Toji",
  "Syed R. Ahmed",
  "Jackson Williams Jr.",
  "Jesus Sillas",
  "Lt. J. Rader",
  "Sgt. D. Jones",
  "Noel Simpson",
  "Angel Hernandez",
  "Liz Milner",
  "Elizabeth Hare",
  "Francisco Quinteros",
  "Dan Reichel",
  "Rebecca Cardenas",
  "Donna Dannemiller",
  "Francisco Quinteros",
  "Dan Reichel",
  "Nathan Smith",
  "Charles Gibbs",
  "Tom McEnroe",
  "Liz Milner",
  "Kyndra Mitchell JIO",
  "Larry Franklin",
  "Bridget Wright",
  "Jackie Stoud",
  "Morris Gaede",
  " Jasmin Guevara",
  "Wilona Lewis",
  "Gerry Burney",
  "Kate Feigin",
  "Undan, Brian",
  "John Gatlin",
  "Shalimar Jackson",
  "Linda Barrett",
  "Lt Sloat",
  "Sgt Baker",
  "Shahid Hami",
  "Lt. Espinoza ",
  "Daniel Henry",
  "Heath Holland",
  "Heath Holland",
  "Michael Blue Sr.",
  "Michael Blue Sr.",
  "Michael Blue Sr.",
  "Buddy Balagia",
  "Andrew Hyer",
  "Chief Laura E. Bedard, Ph.D",
  "Sgt. Amy R. Lawshe",
  "Alexandra Hopkins",
  "Capt. Latisha Howard",
  "Terry-Luz Cruz",
  "Capt. Kip Beacham",
  "Amy Ridgely",
  "William Ingersoll",
  "Aquinette K. Harrison",
  "Vincent",
  "Lawrence Yerger",
  "Lori Norwood",
  "Lawrence Yerger ",
  "Lori Norwood",
  "Thomas Simmons",
  "Joshua Pitts",
  "David J. Odum",
  "Christopher Atkins",
  "Walt Summers",
  "Darrell Brett",
  "Jazmin Cornett",
  "Caytona Saunders",
  "Noemi Navarro",
  "Jon Carner",
  "Brian Johnson",
  "Jerry Buscher",
  "Rutha Speights",
  "Robert Conner",
  "Justin Brown",
  "Steve Lewallen",
  "Alan McMillan",
  "None",
  "Jimmy Salters",
  "Chaplain George",
  "Paul Allen",
  "Chaplain George",
  "Paul Allen",
  "Chaplain Burch",
  "Paul Allen",
  "Andrew Messer",
  "Captain Loggins",
  "Lieutenant Cook",
  "Jason Crawford",
  "James Keffer",
  "Barry Reddish",
  "Steven Dean",
  "John Kolodziej",
  "Weberg, Gary",
  "Janet Lawrence",
  "James Edwards",
  "Bob Govoni",
  "Jeffery Ehlers",
  "Shawn Branham",
  "Craig Hanks",
  "Andrew M. Neamtu",
  "Andrew M. Neamtu",
  "Ed Mcclenahan",
  "Evan Westlake",
  "Scott Van Zandt",
  "Evan Westlake",
  "Scott Van Zandt",
  "David Maddox",
  "Eric Randall",
  "David Maddox",
  "Eric Randall",
  "Gary B King",
  "Eddie Johnson",
  "William Green Jr.",
  "Admin. Clerk",
  "Head Chaplain",
  "Test",
  "Steven Clark",
  "Seals, Michael",
  "Polk, Randall L.",
  "Seals, Michael",
  "Polk, Randall L.",
  "Seals, Michael",
  "Polk, Randall L.",
  "Mr wood",
  "Mr brown",
  "Scott Thompson",
  "Kenneth Boone",
  "Kenneth Boone",
  "Kenneth Boone",
  "Vernon Phillips",
  "Erica Beamon",
  "Thomas",
  "Thomas",
  "Thomas",
  "Robert Brown",
  "Eric Botley",
  "James Davis",
  "James Davis",
  "Joseph Henkle",
  "Chris Wynn",
  "Don Davis",
  "Christopher Bailey",
  "Chris Wynn",
  "Don Davis",
  "Michael Seals",
  "Francisco Quinteros",
  "Dan Riechel",
  "Andrew Pak",
  "Andrew Pak",
  "Patrick Callahan",
  "Rosa Grumbe",
  "Jasmin Guevara",
  "Wilona Lewis",
  "Jasmin Guevara",
  "Wilona Lewis",
  "Jasmin Guevara",
  "Wilona Lewis",
  "Jasmin Guevara",
  "Wilona Lewis",
  "Jeffrey Thompson",
  "Christina Frost",
  "Jeffrey Thompson",
  "Christina Frost",
  "Jeffrey Thompson",
  "Christina Frost",
  "Jeffrey Thompson",
  "Christina Frost",
  "Roxine Callahan",
  "Andrew Gordon",
  "Pat Callahan",
  "Rachael Senechal",
  "Rachael Senechal",
  "Jan Willars",
  "Test",
  "Frank Rantasha",
  "Joshua Collins",
  "Joshua Collins",
  "Joshua Collins",
  "Oscar Cox",
  "Joseph Certo ",
  "Wade Reikofski",
  "Joel Hansen",
  "Peter Klein",
  "Richard Conklin",
  "Mark Daw",
  "Alexander Mirrow",
  "Trevor Johnson",
  "Justin Houston",
  "Raymond Stern",
  "Jerry Mattern ",
  "Scott Wilson / Timothy Lindsey",
  "Raymond Stern",
  "Jerry Mattern",
  "Lewis Tilton",
  "Daniel Kelly",
  "Wren Metcalf",
  "Louis Joseph",
  "Brad Brooks",
  "Randall Stegner",
  "Richard Werth",
  "Trevor Johnson",
  "Justin Houston",
  "Chris Holmes",
  "Matt VanDuzee",
  "Olorunseun Ogunwobi",
  "Chip Hoffman",
  "Ron Weaver ",
  "Steve LeFave",
  "Alan Rassie",
  "Samuel Rahal ",
  "Hiram Morales",
  "Keeman",
  "Alan Rassie",
  "Samuel Rahal ",
  "Lewis Tilton",
  "Keeman",
  "Alan Rassie",
  "Samuel Rahal",
  "Lewis Tilton",
  "Keeman",
  "William Meyer",
  "Marc Pierson",
  "Troy Hopson",
  "Rodney Mix",
  "Charlie Crossley",
  "Chris Holmes",
  "Rev. Peter Grinion",
  "Christopher Hilton",
  "Randy Watroba",
  "Gary Griffin",
  "Chip Hoffman",
  "Ron Weaver",
  "Larry DaPonte",
  "Isaiah Suarez",
  "Daniel Keller",
  "Nathan Haines",
  "Richard Darker",
  "Caleb Burkett",
  "Randall Stegner",
  "Sheila McCollough",
  "Roopnarine",
  "Jerry Licianovic",
  "Leon Coon",
  "Earl Campbell",
  "Gregory Henderson",
  "Austin Ekstrum",
  "Judith Minnick",
  "Tomlinson",
  "Rodney Mix",
  "Charlie Crossley ",
  "To be announced",
  "C. Michael Horton",
  "Phil Pompio",
  "Jeremiah Johnson",
  "Jared Bailey",
  "Timothy Brock",
  "Dan Perry",
  "Tim Agan",
  "Nathan Adekoya",
  "Edward Gladney",
  "David Brinkman",
  "Bryant Coe",
  "Trevor Johnson",
  "Justin Houston",
  "Chris Holmes",
  "Matthew Salvadore",
  "Ralph Dewolfe",
  "To be announced",
  "Mike Benjamin",
  "David Rieffanaugh",
  "David Brinkman",
  "Byrant Coe",
  "Austin Ekstrum",
  "Thomas Diina",
  "Earl Campbell",
  "Gregory Henderson",
  "Austin Ekstrum",
  "Thomas Diina",
  "Stephen Crosson",
  "Joe Parker",
  "Michael Barclay",
  "Murray Mayfield",
  "Heather Beschler",
  "Luis de la Rosa",
  "Alexander Mirrow",
  "Randy Watroba",
  "Gary Griffin",
  "Jean Altidor",
  "William Meyer",
  "Marc Pierson",
  "To be announced",
  "Robert Elser",
  "Scott Lane ",
  "Troy Johnson",
  "Chad Redling",
  "Nathan Adekoya",
  "Edward Gladney",
  "Joe Rodriguez ",
  "William Meyer",
  "Marc Pierson",
  "Larry DaPonte",
  "Lynn Odrzywolski",
  "Ron Dewberry",
  "Richard Darker",
  "Caleb Burkett",
  "Mark Jordan",
  "Sister Roz",
  "Raymond Stern",
  "Jerry Mattern",
  "Hiram Morales",
  "Mark Daw",
  "Chip Hoffman",
  "Ron Weaver",
  "Troy Johnson",
  "Chad Redling",
  "William Zipfel",
  "David Rieffanaugh",
  "Richard Conklin",
  "Gary Barwig",
  "Mike Arthur",
  "Walter Dennis",
  "Gary Barwig",
  "Mike Arthur",
  "To be annoucned",
  "Nicholas Lynch",
  "Alan Rassie",
  "Samuel Rahal",
  "To be announced",
  "James Crowell",
  "Donald Haugh",
  "William Leveson",
  "Donald Haugh",
  "William Leveson",
  "James Stratton",
  "Chip Hoffman",
  "Ron Weaver",
  "Chip Hoffman",
  "Ron Weaver",
  "Joshua Avery",
  "Dwain Brown",
  "To be announced",
  "Esteban Gonzalez",
  "Eric Jennison",
  "Jay Naples",
  "To be announced",
  "Christian Smith",
  "Aaron Morrell",
  "Donald Haugh",
  "William Leveson",
  "To be announced",
  "Timothy Flynn",
  "William Meyer",
  "Marc Pierson",
  "Shaun Ammerman",
  "Mark Daw",
  "To be announced",
  "Raymond Hodge",
  "Shaun Ammerman",
  "Marc Daw",
  "David Brinkman",
  "Byrant Coe",
  "Paul Kubala",
  "Gary Barwig",
  "Mike Arthur",
  "Jeff Calkins",
  "Joshua Avery",
  "Dwain Brown",
  "Jim Stone",
  "Daniel Kelly",
  "Wren Metcalf",
  "To be announced",
  "William Bieyle",
  "Trevor Johnson",
  "Justin Houston",
  "Brent McCurty",
  "Sean Lansbury",
  "Omar Osbourne",
  "Joshua Avery",
  "Dwain Brown",
  "Esteban Gonzalez",
  "Jesse Fullard",
  "Kevin Wenk",
  "Chris Holmes",
  "Brendan Muldoon ",
  "Shaun Ammerman",
  "Mark Daw",
  "To be announced",
  "Jim Perry",
  "Jerry Lucianovic",
  "Leon Coon",
  "Chip Hoffman",
  "Ron Weaver",
  "Randy Watroba",
  "Gary Griffin",
  "Chip Hoffman",
  "Ron Weaver",
  "Raymond Brunce",
  "David Brinkman",
  "Byrant Coe",
  "Joshua Avery",
  "Dwain Brown",
  "Reginald Scott",
  "Nathan Adekoya",
  "Hal McCall",
  "Louis Joseph",
  "Brad Brooks",
  "Louis Joseph",
  "Brad Brooks",
  "Reginald Scott",
  "Reginald Scott",
  "Reginald Scott",
  "Reginald Scott",
  "Reginald Scott",
  "Reginald Scott",
  "Reginald Scott",
  "Reginald Scott",
  "Reginald Scott",
  "David Brinkman",
  "Byrant Coe",
  "Daniel Keller",
  "Nathan Haines",
  "Daniel Keller",
  "Nathan Haines",
  "Rodney Mix",
  "Charlie Crossley",
  "Richard Darker",
  "Caleb Burkett",
  "Joshua Avery",
  "Dwain Brown",
  "Raymond Stern",
  "Jerry Mattern",
  "Richard Darker",
  "Caleb Burkett ",
  "Randy Watroba",
  "Gary Griffin",
  "Raymond Stern",
  "Jerry Mattern",
  "David Brinkman",
  "Byrant Coe",
  "Eric Jennison",
  "Jay Naples",
  "Scott Lane ",
  "Matthew Salvadore",
  "Ralph Dewolfe",
  "Earl Campbell",
  "Gregory Henderson",
  "Oscar Cox",
  "Joseph Certo",
  "Richard Darker",
  "Caleb Burkett",
  "Stephen Crosson",
  "Joe Parker",
  "Gary Barwig",
  "Mike Arthur",
  "Richard Conklin",
  "David Brinkman",
  "Byrant Coe",
  "Alan Rassie",
  "Samuel Rahal",
  "David Brinkman",
  "Byrant Coe",
  "Jesse Fullard",
  "Kevin Wenk",
  "Brent McCurty",
  "Sean Lansbury",
  "Shaun Ammerman",
  "Mark Daw",
  "Shaun Ammerman",
  "Mark Daw",
  "Randy Watroba",
  "Gary Griffin ",
  "Jesse Fullard",
  "Kevin Wenk",
  "Alan Rassie",
  "Samuel Rahal",
  "Alan Rassie",
  "Samuel Rahal",
  "Daniel Keller",
  "Nathan Haines",
  "Brent McCurty",
  "Sean Lansbury",
  "Jerry Lucianovic",
  "Leon Coon",
  "Randy Watroba",
  "Gary Griffin",
  "Jesse Fullard",
  "Kevin Wenk",
  "Richard Conklin",
  "Raymond Stern",
  "Jerry Mattern",
  "Richard Conklin",
  "Stephen Crosson",
  "Joe Parker",
  "Chip Hoffman",
  "Ron Weaver",
  "Jesse Fullard",
  "Kevin Wenk",
  "Brent McCurty",
  "Sean Lansbury",
  "Earl Campbell",
  "Gregory Henderson",
  "David Brinkman",
  "Byrant Coe",
  "Alan Rassie",
  "Samuel Rahal",
  "Richard Darker",
  "Caleb Burkett",
  "Joshua Avery",
  "Dwain Brown",
  "Jesse Fullard",
  "Kevin Wenk",
  "Daniel Kelly",
  "Wren Metcalf",
  "Brent McCurty",
  "Sean Lansbury",
  "Raymond Stern",
  "Jerry Mattern",
  "Gary Barwig",
  "Mike Arthur",
  "Rodney Mix",
  "Charlie Crossley",
  "Louis Joseph",
  "Brad Brooks",
  "Randy Watroba",
  "Gary Griffin ",
  "Joshua Avery",
  "Dwain Brown",
  "Earl Campbell",
  "Gregory Henderson",
  "Rodney Mix",
  "Charlie Crossley",
  "Jesse Fullard",
  "Kevin Wenk",
  "Scott Lane ",
  "David Brinkman",
  "Byrant Coe",
  "Matthew Salvadore",
  "Ralph Dewolfe",
  "Stephen Crosson",
  "Joe Parker",
  "Phil Pompio",
  "Jeremiah Johnson",
  "Oscar Cox",
  "Joseph Certo",
  "Matthew Salvadore",
  "Ralph Dewolfe",
  "William Meyer",
  "Marc Pierson",
  "Officer Kalet",
  "Scott Lane ",
  "Matthew Salvadore",
  "Ralph Dewolfe",
  "Chris Holmes ",
  "Brendan Muldoon",
  "Scott Lane ",
  "Jerry Lucianovic",
  "Leon Coon",
  "Eric Jennison",
  "Jay Naples",
  "William Meyer",
  "Marc Pierson",
  "Scott Heggelke",
  "Jerry Lucianovic",
  "Leon Coon",
  "Jerry Lucianovic",
  "Leon Coon",
  "Brent McCurty",
  "Sean Lansbury",
  "Joshua Avery",
  "Dwaine Brown",
  "Earl Campbell",
  "Gregory Henderson",
  "Chip Hoffman",
  "Ron Weaver",
  "Shaun Ammerman",
  "Mark Daw",
  "Bill Meyer",
  "Marc Pierson",
  "Greg Gilfus",
  "Earl Campbell",
  "Gregory Henderson",
  "Daniel Keller",
  "Nathan Haines",
  "Louis Joseph",
  "Brad Brooks",
  "Scott Lane ",
  "Chip",
  "Edward Lomeli",
  "Jim Smith",
  "Jan W",
  "Test Person",
  "Tester Jones",
  "Richard Conklin",
  "Matthew Salvadore",
  "Ralph Dewolfe",
  "Matthew Salvadore",
  "Ralph Dewolfe",
  "William Meyer",
  "Marc Pierson",
  "Donald Haugh",
  "William Leveson",
  "Catherine Thomas",
  "Joshua Avery",
  "Dwain Brown",
  "Louis Joseph",
  "Brad Brooks",
  "To be announced ",
  "Rodney Mix",
  "Charlie Crossley",
  "Alan Rassie",
  "Samuel Rahal",
  "Lewis Tilton",
  "Eric Jennison",
  "Jay Naples",
  "Eric Jennison",
  "Jay Naples",
  "Gary Barwig",
  "Mike Arthur",
  "Rachel Muntz",
  "Christa Foley",
  "Nathan Adekoya",
  "Edward Gladney",
  "Raymond Stern",
  "Jerry Mattern",
  "Louis Joseph",
  "Brad Brooks",
  "Nathan Adekoya",
  "Edward Gladney",
  "Nathan Adekoya",
  "Edward Gladney",
  "Nathan Adekoya",
  "Edward Gladney",
  "Nathan Adekoya",
  "Edward Gladney",
  "Rodney Mix",
  "Charlie Crossley"]

const threePartNames = [
  'Syed R. Ahmed',
  'Jackson Williams Jr.',
  'Lt. J. Rader',
  'Sgt. D. Jones',
  'Kyndra Mitchell JIO',
  'Michael Blue Sr.',
  'Michael Blue Sr.',
  'Michael Blue Sr.',
  'Capt. Latisha Howard',
  'Capt. Kip Beacham',
  'Aquinette K. Harrison',
  'David J. Odum',
  'Andrew M. Neamtu',
  'Andrew M. Neamtu',
  'Scott Van Zandt',
  'Scott Van Zandt',
  'Gary B King',
  'William Green Jr.',
  'Polk, Randall L.',
  'Polk, Randall L.',
  'Polk, Randall L.',
  'Rev. Peter Grinion',
  'To be announced',
  'C. Michael Horton',
  'To be announced',
  'To be announced',
  'To be annoucned',
  'To be announced',
  'To be announced',
  'To be announced',
  'To be announced',
  'To be announced',
  'To be announced',
  'To be announced',
  'To be announced ',
]

const fourPartNames = [
  'Sgt. Amy R. Lawshe',
  'Luis de la Rosa',
]

const fivePartNames = [
  'Chief Laura E. Bedard, Ph.D',
  'Scott Wilson / Timothy Lindsey'
]