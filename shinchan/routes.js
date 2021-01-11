const express = require("express");
const routes= express.Router();
const mongoose= require('mongoose');
const bodyparser = require('body-parser');

const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const shortId = require('shortid');
routes.use(bodyparser.urlencoded({extended:true}));
const user=require('./models/user')
routes.use(cookieParser('secret'));
routes.use(session({
    secret:'secret',
    maxAge:3600000,
    resave:true,
    saveUninitialized:true,
}));
const mongourl='mongodb+srv://naman:indranil@cluster0.0ryqu.mongodb.net/literary?retryWrites=true&w=majority'
const passport = require("passport");

mongoose.connect(mongourl  ,{
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=>console.log("User DATA Connected"));

routes.get('/',(req,res)=>{
    res.render('index');
})

routes.get('/success',async function(req,res){
    var mysort = { time: -1 };
    const alluser=await user.find({flag:"1"}).sort(mysort);
     res.render('success',{posts:alluser});
    // res.render('success',{'user':req.user,shortUrls:shortUrls});
});
routes.get('/addPost',(req,res)=>{
    res.render('addPost');
});
routes.post('/addPost',async function(req,res,next){
    
     var v= await user.create({author:req.body.name,email:req.body.email,title:req.body.title,content:req.body.content});
    
    
    // console.log(v.author,v.email,v.title,v.content);
    v.save();
    // console.log(req.body.name,req.body.email,req.body.title,req.body.content);
   
    res.redirect('/success');
});


module.exports = routes;