//jshint esversion:6
require('dotenv').config() //Put this on top.This will be active and running so we are not setting a constant for it.
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

//to connect to our mongoDB
mongoose.connect("mongodb://localhost:27017/userDB",
{useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false });

//this schema is no longer simple a JS object but it is an object created from mongoose schema class.
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});
/*In plugin we have added encryption package to userSchema by encryption
we have added secret that we will use to encrypt our Password through secret:secrets
we have added fields that we want to encrypt through encryptedFields*/

const User=mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const newUser=new User({
    email:req.body.username,
    password:req.body.password
  });
  newUser.save(function(err){ //When save function is called thenbehind the scene mongoose encrypt will encrypt  password field
    if(err){
      console.log(err);
    } else{
      res.render("secrets");
    }
  });

});

app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;

  User.findOne({email:username},function(err,foundUser){ /*when this findOne function is called then mongoose
    will decrypt password field to compare it with password entered by user*/
    if(err){
      console.log(err);
    } else{
      if(foundUser){
        if(foundUser.password===password){
          res.render("secrets");
        }
        else{
          res.send("Invalid login credentials");
        }
      }
    }
  });

});

app.listen(3000,function(){
  console.log("Server started on port 3000");
});
