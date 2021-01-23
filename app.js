//jshint esversion:6
require('dotenv').config() //Put this on top.This will be active and running so we are not setting a constant for it.
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

//Its really important to place your code in the same order
//we have initialized session telling our app to use session package
app.use(session({
  //setting up initial configuration
  secret:"Our little secret.",
  resave:false,
  saveUninitialized:false
}));

// to initialize passport
app.use(passport.initialize());

//telling our app to use passport to set up our session
app.use(passport.session());

//to connect to our mongoDB
mongoose.connect("mongodb://localhost:27017/userDB",
{useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false });
mongoose.set("useCreateIndex", true);

//this schema is no longer simple a JS object but it is an object created from mongoose schema class.
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

//set up for passportLocalMongoose to plugin userSchema with passportLocalMongoose it has to be a mongoose schema
userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);

//default code for using passportLocalMongoose from its documentation
passport.use(User.createStrategy()); //creating local login strategy

passport.serializeUser(User.serializeUser());//to serialize user
passport.deserializeUser(User.deserializeUser());//to deserialize user

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  //if the user is authenticated means user is already logged in here we rely on session,passport,passport local,passportLocalMongoose
//only then render secrets page
if(req.isAuthenticated()){
  res.render("secrets");
} else{
  res.redirect("/login");
}

});

app.get("/logout",function(req,res){
  //Here we deauthenticate user and end that user session
  req.logout();
  res.redirect("/");
});

app.post("/register",function(req,res){
//this register method come from passport local mongoose
User.register({username:req.body.username},req.body.password,function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
  } else{
    //if no err then we will try to authenticate user by local strategy
    passport.authenticate("local")(req,res,function(){
      /*this callback function only triggered if authentication was successful and
      we manage setup cookie that saves user current login session*/

      res.redirect("/secrets"); //Now no need to render secrets page user can directly go to secrets page
                                //by /secrets.Thanks to cookies!!
    })
  }
})

});

app.post("/login",function(req,res){

const user=new User({
  username:req.body.username,
  password:req.body.password
});

//this login method come from passport
req.login(user,function(err){  //user came from login credentials
  if(err){
    console.log(err);
  } else{
    passport.authenticate("local") (req,res,function(){
      /*this callback function only triggered if authentication was successful and
      we manage setup cookie that saves user current login session*/

      res.redirect("/secrets"); //Now no need to render secrets page user can directly go to secrets page
                                //by /secrets.Thanks to cookies!!
    });
  }
});

});

app.listen(3000,function(){
  console.log("Server started on port 3000");
});
