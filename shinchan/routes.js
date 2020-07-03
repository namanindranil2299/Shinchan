const express = require("express");
const routes= express.Router();
const mongoose= require('mongoose');
const bodyparser = require('body-parser');
const e = require("express");
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const ShortUrl=require('./models/shortUrls');
const shortId = require('shortid');
routes.use(bodyparser.urlencoded({extended:true}));
const user = require('./models.js');
routes.use(cookieParser('secret'));
routes.use(session({
    secret:'secret',
    maxAge:3600000,
    resave:true,
    saveUninitialized:true,
}));
const mongourl='mongodb+srv://namanindra:namanindra@demo.y0wsb.mongodb.net/logintry?retryWrites=true&w=majority'
const passport = require("passport");
//|| 'mongodb://localhost/logintry'
mongoose.connect(mongourl  ,{
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=>console.log("User DATA Connected"));
// mongoose.connect('mongodb://localhost/urlShortner',{
//     useNewUrlParser: true, useUnifiedTopology: true
// }).then(()=>console.log("URL Data Connected"));
// mongoose.connection.on('connected',()=>{
//     console.log("online db connected");
// });

routes.use(passport.initialize());
routes.use(passport.session());

routes.use(flash());




routes.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

const checkAuthenticated = function(req,res,next){
    if(req.isAuthenticated())
    {
        res.set('Cache-Control','no-cache,private,no-store, must-revalidate,post-check=0,pre-check=0');
        return next();
    }
    else{
        res.redirect('/login');
    }
};


routes.get('/',(req,res)=>{
    res.render('index');
});

routes.post('/register',(req,res)=>{
    var{email,username,password,confirmpassword}=req.body;
    var err;
    if(!email || !username || !password || !confirmpassword)
    {
        err="Please Fill All Fields";
        res.render('index',{'err':err});
    }
    if(password != confirmpassword)
    {
        err="Passwords Don't Match";
        res.render('index',{'err':err , 'username':username, 'email':email});
    }
    if(typeof err == 'undefined')
    {
        user.findOne({email:email},function(err,data){
            if(err) throw err;
            if (data){
                console.log("USER ALREADY EXISTS");
                err="User Already Exists with this EMAIL";
                res.render('index',{'err':err , 'username':username, 'email':email});
            }
            else{
                bcrypt.genSalt(10,(err,salt)=>{
                    if(err) throw err;
                    bcrypt.hash(password,salt,(err,hash)=>{
                        if(err) throw err;
                        password=hash;
                        user({
                            email,
                            username,
                            password
                        }).save((err,data)=>{
                            if(err) throw err;
                            req.flash("success_message","Registered Successfully :: LogIn to Continue");
                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});

var localStrategy = require("passport-local").Strategy;
passport.use(new localStrategy({usernameField:'email'},(email,password,done)=>{
    user.findOne({email:email},(err,data)=>{
        if(err) throw err;
        if(!data){
            return done(null,false,{message:"Account With This Mail Doesn't Exists"});
        }
        bcrypt.compare(password,data.password,(err,match)=>{
            if(err) throw err;
            if(!match)
            {
                return done(null,false,{message:"Password Incorrect"});
            }
            if(match)
            {
                return done(null,data);
            }
        });
    });
}));

passport.serializeUser(function(user,cb){
    cb(null,user.id);
});
passport.deserializeUser(function(id,cb){
    user.findById(id,function(err,user){
        cb(err,user);
    });
});


routes.get('/login',(req,res)=>{
    res.render('login');
});

routes.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/success',
        failureFlash:true,        
    })(req,res,next);
});

routes.get('/success',checkAuthenticated,async function(req,res){
    const val = req.user.email;
    const shortUrls=await ShortUrl.find({email:val});
    res.render('success',{'user':req.user,shortUrls:shortUrls});
});
routes.get('/logout',function(req,res){
    req.logout();
    res.redirect('/login');
});
routes.post('/shortUrls',checkAuthenticated,async function(req,res){
    const v=await ShortUrl.create({full:req.body.fullUrl});
    const val=req.user.email;
    console.log(v);
    v.email=val;
    var sid=shortId.generate();
    const emp = ShortUrl.findOne({short:sid});
    const temp=emp.short;
    while(true)
    {
        
        if(temp==sid)
         sid=shortId.generate();
        else
        {
            break;
        }
    }
    v.short=sid;
    v.save();
    res.redirect('/success');
});

routes.get('/:shortUrl',async function(req,res){
    const shortUrl=await ShortUrl.findOne({short:req.params.shortUrl});
    if(shortUrl==null) return res.sendStatus(404)
    shortUrl.clicks++;
    shortUrl.save();
    res.redirect(shortUrl.full);
});

// routes.post('/addmsg',checkAuthenticated,(req,res)=>{
//     user.findOneAndUpdate(
//         {email:req.user.email},
//         {$push:{
//             messages:req.body['msg']
//         }},(err,suc)=>{
//             if(err) throw err;
//             if(suc) console.log("Added Successfully");
//         }
//     );
//     res.redirect('/success');
// })
module.exports = routes;