import mongoose from 'mongoose'
import Note from '../src/server/data/note'

const uri = process.env.MONGO_URI || 'mongodb://swiftnote:swiftnote@dogen.mongohq.com:10080/epsclubs';

mongoose.connect(uri);

console.log(`Mongo URI: ${uri}`);

const notes = [
  {
    timestamp: new Date("2015-12-13T14:44:30Z"),
    title: "My First Note",
    description: "Multiline\nText Here",
    tags: [
      "note",
      "unicorns"
    ],
    file_path: null
  },
  {
    timestamp: new Date("2015-12-14T14:44:30Z"),
    title: "My Second Note",
    description: "Second\nNote",
    tags: [
      "note",
      "second"
    ],
    file_path: null
  },
  {
    description: "Test Mutation updateNote",
    tags: [
      "updated"
    ],
    timestamp: new Date("2015-12-15T14:44:30Z"),
    title: "Update 1"
  }
]

mongoose.connection.collections['swiftnote'].drop( (err) => {

  Note.create(notes, (err, res) => {

    if (err) {
      console.log(err);
    }
    else {
      console.log('Seed data created.');
    }

    process.exit();

  });

});
