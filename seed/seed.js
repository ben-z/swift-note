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
    files: []
  },
  {
    timestamp: new Date("2015-12-14T14:44:30Z"),
    title: "My Second Note",
    description: "Second Note\nsecond line.",
    tags: [
      "note",
      "second"
    ],
    files: [{name:"file1",uid:"0001"},{name:"file2",uid:"0002"}]
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
