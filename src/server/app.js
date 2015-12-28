// Inspirations: https://github.com/RisingStack/graphql-server

import express from 'express'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import Note from './data/note'
import graphqlHTTP from 'express-graphql'
import {Schema} from './data/schema.js'
import browserify from 'browserify'
import babelify from 'babelify'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ClientApp from '../client/app'
import objectAssign from 'object-assign'
Object.assign = Object.assign || objectAssign

let app = express()
app.use(cookieParser())

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

// Initiate Database Connection
if(process.env.NODE_ENV !== 'test'){
  const uri = process.env.MONGO_URI || 'mongodb://swiftnote:swiftnote@dogen.mongohq.com:10080/epsclubs';
  console.log(`Mongo URI: ${uri}`);
  mongoose.connect(uri);
}

app.get('/', (req, res)=>{
  ClientApp.fetchList(void 0,(props)=>{
    let prerender = ReactDOMServer.renderToString(<ClientApp {...props} />);
    res.render('index', {title: 'SwiftNote', message: 'Work In Progress', prerender: prerender, props: JSON.stringify(props)});
  })
})

app.get('/login', (req,res)=>{
  res.cookie('user','12345',{maxAge: 900000});
  res.send('<a href="/graphql">back to graphql</a><br /><a href="/logout">logout</a>');
})

app.get('/logout', (req,res)=>{
  res.clearCookie('user');
  res.send('<a href="/graphql">back to graphql</a><br /><a href="/login">login</a>');
})

app.use('/graphql',(req,res,next)=>{
  // if (req.cookies.user==='12345') {
  if(true){ //TODO: new authentication method
    next();
  }else{
    res.redirect('/login')
  }
})

app.get('/app.js',(req,res)=>{
  browserify().add(__dirname+'/../client/app.js').transform(babelify).bundle().pipe(res);
})

app.use('/fonts', express.static(__dirname+'/../client/fonts'));

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
