// Inspirations: https://github.com/RisingStack/graphql-server

import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import Note from './data/note'
import File from './data/file'
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

let app = express()
app.use(bodyParser.json({limit:'50mb'}))
app.use(cookieParser())

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

// Initiate Database Connection
if(process.env.NODE_ENV !== 'test'){
  const uri = process.env.MONGO_URI || 'mongodb://swiftnote:swiftnote@dogen.mongohq.com:10080/epsclubs';
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

app.post('/upload',(req,res)=>{
  let file = new File(req.body);
  file.save(err=>{
    if(err) throw err;
    else res.json({id: file.id})
  })
})

app.get('/file/:uid',(req,res)=>{
  File.findById(req.params.uid,(err,file)=>{
    if (err) res.json({success: false, err:err});
    if (!file) res.json({success:false, err: 'file not found'});
    res.json({success:true,data:file});
  })
})

app.get('/file/:uid/download',(req,res)=>{
  File.findById(req.params.uid,(err,file)=>{
    if (err) res.send(err);
    if (!file) res.send('file not found')
    res.setHeader('Content-disposition', `attachment; filename=${file.name}`)
    res.send(file.content);
  })
})

app.get('/app.js',(req,res)=>{
  browserify().add(__dirname+'/../client/app.js').transform(babelify).bundle().pipe(res);
})

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
