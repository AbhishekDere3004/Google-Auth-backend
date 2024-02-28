require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('./db/conn')
const app = express();
const port = 1002;
const session = require("express-session");
const passport = require("passport")
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./model/userSchema")
const clientid = "1074331704918-rtro8lp4lmihioqbi9ge6hqnasvd451t.apps.googleusercontent.com"
const clientsecret ="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"
// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());

mongoose.connection;

app.use(session({
    secret:"12345678abhi",
    resave:false,
    credentials:true,
    saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session())


passport.use(
    new OAuth2Strategy({
        clientID:clientid,
        clientSecret: clientsecret,
        callbackURL:"/auth/google/callback",
        scope:["profile" , "email"]


    },
    async(accessToken, referashToken,profile,done)=>{
        console.log("profile", profile)
        try {
            let user = await userdb.findOne({googleId:profile.id});

            if(!user){
                user =new userdb({
                    googleId:profile.id,
                    displayName:profile.displayName,
                    email:profile.emails[0].value,
                    image:profile.photos[0].value
                });
                await user.save();
            }
            return done(null ,user)
        } catch (error) {
            return done (error, null)
        }
    })
);

passport.serializeUser((user, done)=>{
    done(null,user);
});

passport.deserializeUser((user,done)=>{
    done(null ,user)
});

//initial google oauth login 

app.get("/auth/google", passport.authenticate("google", {scope:["profile","email"]}));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect:"http://localhost:3000/dashboard",
    failureRedirect:"http://localhost:3000/login"
}));

app.get("/login/sucess", async(req,res)=>{
    console.log("reqqq",req.user)

    if(req.user){
        res.status(200).json({massage:"user Login",user:req.user})
    }else{
        res.status(400).json({massage:"Not Authorized"})
    }
});

app.get("/logout",(req,res,next)=>{
    req.logout(function(err){
        if(err){return next(err)}
        res.redirect("http://localhost:3000");
    })
})
// Routes
// app.use("/", (req, res) => {
//     res.status(200).json('Server start');
// });
// Start server

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));