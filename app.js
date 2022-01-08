//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");//step 1..
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");//step 1 end


const app = express();

// console.log(process.env.API_KEY);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//step2:set up session
app.use(session({
secret:"Our Little Secret.",
resave: false,
saveUninitialized: false
}));

app.use(passport.initialize()); //step 3
app.use(passport.session());//step 4

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
//the schema needs to be mongoose schema inorder to have plugin .It cant be normal schema
userSchema.plugin(passportLocalMongoose);//step 5

const User=new mongoose.model("User",userSchema);

//step 6..
// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//step 6 ends

app.get("/",function(req,res){
  res.render("home");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render ("secrets");
  }
  else{
    res.redirect("/login");
  }
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});
app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
User.register({username:req.body.username},req.body.password,function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }
  else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});
});

app.get("/login",function(req,res){
  res.render("login");
});
app.post("/login",function(req,res){

  const user=new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  })
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
