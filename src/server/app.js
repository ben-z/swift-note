// Inspirations: https://github.com/RisingStack/graphql-server

import fs from 'fs'
import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import multer from 'multer'
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
// Object.assign fallback
Object.assign = Object.assign || objectAssign

let upload = multer({dest:'uploads/'})

let app = express()
app.use(bodyParser.json({limit:'50mb'}))
app.use(cookieParser())

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

// Initiate Database Connection
if(process.env.NODE_ENV !== 'test'){
  const uri = process.env.MONGO_URI || 'mongodb://localhost/swiftnote';
  console.log(`Mongo URI: ${uri}`);
  mongoose.connect(uri);
}

 // ######
 // #     #  ####  #    # ##### ######  ####
 // #     # #    # #    #   #   #      #
 // ######  #    # #    #   #   #####   ####
 // #   #   #    # #    #   #   #           #
 // #    #  #    # #    #   #   #      #    #
 // #     #  ####   ####    #   ######  ####

app.get('/', (req, res)=>{
  ClientApp.fetchList((props)=>{
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

app.post('/upload',upload.array('files'),(req,res)=>{
  console.log(req.files);
  res.json({uids: req.files.map(f=>{return {name:f.originalname,uid:f.filename}})});
})

app.get('/file/download/:name/:uid/:type/:size',(req,res)=>{
  let name = decodeURIComponent(req.params.name);
  let uid = decodeURIComponent(req.params.uid);
  let size = decodeURIComponent(req.params.size);
  let type = decodeURIComponent(req.params.type);

  console.log('File Requested:',name,uid,size,type);

  let path = `uploads/${uid}`

  // Retrieving file
  try{
    fs.statSync(path); // will throw error if the file does not exist

    res.setHeader('Content-Description', 'File Transfer');
    if(type) res.setHeader('Content-Type', type);
    if(size) res.setHeader('Content-Length', size)
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`)

    var readStream = fs.createReadStream(path);
    // replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  }catch(err){
    console.error(err);
    res.status(404).send('the file does not exist');
  }
})

app.get('/app.js',(req,res)=>{
  browserify().add(__dirname+'/../client/app.js').transform(babelify).bundle().pipe(res);
})

app.use('/css', express.static(__dirname+'/../client/css'));

app.use('/fonts', express.static(__dirname+'/../client/fonts'));

app.use('/graphql',(req,res,next)=>{
  // if (req.cookies.user==='12345') {
  if(true){ //TODO: new authentication method
    next();
  }else{
    res.redirect('/login')
  }
})

app.use('/graphql',graphqlHTTP({
  schema: Schema,
  // rootValue: {
  //   col: db.collection('swiftnote'),
  //   objID: ObjectId
  // },
  graphiql: true
}))

 //  #####
 // #     # ###### #####  #    # ###### #####
 // #       #      #    # #    # #      #    #
 //  #####  #####  #    # #    # #####  #    #
 //       # #      #####  #    # #      #####
 // #     # #      #   #   #  #  #      #   #
 //  #####  ###### #    #   ##   ###### #    #

let server = app.listen(8000, ()=>{
  console.log('\u0007');
  console.log(`server started on port ${server.address().port}`);
});

export default app;
