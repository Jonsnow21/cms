import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import http from 'http';
import event from 'events';
import io from 'socket.io';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import multer from 'multer';
import fs from 'fs';
import passportLocalMongoose from 'passport-local-mongoose';
import postRoutes from './server/routes/posts.routes';
import commentRoutes from './server/routes/comments.routes';
import authRoutes from './server/routes/auth.routes';
import userRoutes from './server/routes/users.routes';
import seedDb from './seed';
import {passportConfig} from './server/config/passport.config';
import {socketFunction} from './server/config/socket.io.config';
import path from 'path';

mongoose.connect('mongodb://localhost/blog');

const sanitizer = require('sanitize-html');

// Add headers
const app = express();
// seedDb();
const server = http.Server(app);
const socket = io(server);


const localEvent = event.EventEmitter;
const myEvent = new localEvent();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Access-Control-Allow-Origin, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

  next();
 });


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  secret: "I don't know really",
  resave: false,
  saveUninitialized: false
}))

passportConfig(app);

app.use(postRoutes);
app.use(commentRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(express.static(path.join(__dirname, '/client')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use(express.static(path.join(__dirname, 'uploads')))


const port = 6655;

['/admin/', '/admin/:var', '/admin/edit/:var'].forEach(function(url){
  app.get(url, (req, res)=>{
    res.sendFile(path.join(__dirname, '/client', '/dashboard', '/index.html'));
  })
})

const blogRoutes = ['/', '/articles', '/articles/:url', '/contact'];

blogRoutes.forEach(el=>{
  app.get(el, (req, res)=>{
    if(el === '/articles/:url'){
      socketFunction(socket, req.params.url, myEvent)
    }
    res.sendFile(path.join(__dirname, '/client', '/blog', '/blog.html')); 
  })
})

server.listen(process.env.PORT, ()=>{
  console.log(`Express server listening on port ${process.env.PORT} and IP ${process.env.IP}`);
});


