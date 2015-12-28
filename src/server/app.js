// Inspirations: https://github.com/RisingStack/graphql-server

import express from 'express'
import mongoose from 'mongoose'
import Note from './data/note'
import graphqlHTTP from 'express-graphql'
import {Schema} from './data/schema.js'

let app = express()

app.set('view engine', 'jade')

// Initiate Database Connection
if(process.env.NODE_ENV !== 'test'){
  const uri = process.env.MONGO_URI || 'mongodb://swiftnote:swiftnote@dogen.mongohq.com:10080/epsclubs';
  console.log(`Mongo URI: ${uri}`);
  mongoose.connect(uri);
}

app.get('/', (req, res)=>{
  res.render('index', {title: 'SwiftNote', message: 'This feature has not yet been implemented'});
})

app.use('/graphql',graphqlHTTP({
  schema: Schema,
  // rootValue: {
  //   col: db.collection('swiftnote'),
  //   objID: ObjectId
  // },
  graphiql: true
}))

app.get('/notes', (req, res)=>{
  Note.find({},(err, data)=>{
    if(err) throw err;

    res.json(data);
  })
})

app.get('/note', (req, res)=>{
  // db.collection('swiftnote').findOne({_id: new ObjectId("566f1cb8a892d9001d000000")}).then((item)=>{
  //   res.json(item)
  // })
  Note.findById("566f1cb8a892d9001d000000", (err, item)=>{
    if(err) throw err;
    res.json(item)
  })
})

let server = app.listen(8000, ()=>{
  console.log('\u0007');
  console.log(`server started on port ${server.address().port}`);
});

export default app;
