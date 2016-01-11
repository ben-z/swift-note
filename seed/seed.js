import mongoose from 'mongoose'
import Note from '../src/server/data/note'
import fs from 'fs-extra'

const uri = process.env.MONGO_URI || 'mongodb://swiftnote:swiftnote@dogen.mongohq.com:10080/epsclubs';

mongoose.connect(uri);

console.log(`Mongo URI: ${uri}`);

const notes = [
  {
    timestamp: new Date("2015-12-13T14:44:30Z"),
    title: "My First Note",
    description: "Multiline\nText Here",
    tags: [
      "first",
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
    files: [
      {
  			"uid" : "seed_ef02afc12760ec7049b26c036654d755",
  			"file_type" : "application/pdf",
  			"uploadDate" : new Date("2016-01-11T01:05:51Z"),
  			"lastModifiedDate" : new Date("2016-01-11T01:01:31Z"),
  			"size" : 51439,
  			"name" : "pdffile.pdf"
  		},
  		{
  			"uid" : "seed_fe73676b5b10c066edc6a06f6d6d1dc3",
  			"file_type" : "text/plain",
  			"uploadDate" : new Date("2016-01-11T01:05:51Z"),
  			"lastModifiedDate" : new Date("2016-01-11T00:59:16Z"),
  			"size" : 36,
  			"name" : "textfile.txt"
      },
  		{
  			"uid" : "seed_f634d135f775dc8048beb2810c17b4b6",
  			"file_type" : "image/jpeg",
  			"uploadDate" : new Date("2016-01-11T01:05:51Z"),
  			"lastModifiedDate" : new Date("2016-01-11T01:00:44Z"),
  			"size" : 47345,
  			"name" : "imagefile.jpg"
  		}
    ]
  }
]


console.log('Dropping database table');
mongoose.connection.collections['swiftnote'].drop((err) => {
  if(err) throw err;

  console.log('Writing to database');
  Note.create(notes, (err, res) => {
    if (err) throw err;

    console.log('Removing uploads');
    fs.remove('./uploads',(err)=>{
      if(err) throw err;

      console.log('Creating uploads seed');
      fs.copy('./seed/uploads_seed','./uploads',(err)=>{
        if (err) throw err;

        console.log('Seed data created.');
        process.exit();
      })
    })
  });

});
