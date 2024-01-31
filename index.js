//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
app.use('/public', express.static('public'));

// upload files
const multer = require("multer");
// connecting with mongoose
const mongoose = require("mongoose");
// connection
mongoose.connect("mongodb://127.0.0.1:27017/movieDataDB",{
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(() => console.log('Database connected successfully'))
.catch((err) => console.error('Database connection error: ', err));


const movieSchema = new mongoose.Schema({
  movieName : String,
  thumbnail : String,
  director : String ,
  language : String ,
  releaseYear : String,
  rating : String
});

const movieDB = mongoose.model("movieDB", movieSchema);
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.originalname;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

// home page
app.get("/", async function(req, res) {
  const data = await movieDB.find();
  res.render("index", { data,count:""});  
});

// add Movie into database 
app.post("/addMovie", upload.single("thumbnail"),async function(req, res){
  const {movieName, director, language, releaseYear, rating } = req.body;
  try{
    const thumbnail = req.file.filename;
    const newMovie = new movieDB({
      movieName, director, language, releaseYear, rating, thumbnail
    });
    await newMovie.save();
    res.redirect("/");

  }
  catch{
    res.status(500).send("Could Not add the movie");
  }
});

// update the movie
app.post("/updateMovie", upload.single('thumbnail'),async function(req, res){
  const {_id ,movieName, director, language, releaseYear, rating } = req.body;
  try{
    const updateMovie = await movieDB.findOneAndUpdate(
      {_id : _id},
      { $set: { movieName, director, language, releaseYear, rating } },
      {new: true}
      );
      console.log(_id);
    if(updateMovie){
      console.log("Movie Update");
      res.redirect("/");
    }

  }
  catch{
    res.status(500).send("Could Not update the movie");
  }
});

// filter and search 
app.get("/filterAndSearch/:param/:value", async function( req, res){
  const parameter = req.params.param;
  const value = req.params.value;
  const query = {};
  query[parameter] = value;
  console.log(parameter + " " + value);
  const data = await movieDB.find(query);
  res.render("index", { data, count:"" });

}); 
app.get("/delete/:id", async function(req, res){
  try{
    const id = req.params.id;
    const deletedMovie = await movieDB.findOneAndDelete(id);
    if(deletedMovie){
      console.log("Deleted the movie");
      res.redirect("/");
    }
    else{
      res.send("Already Deleted the movie");
    }
  }
  catch{
    res.send("Couldn't delete the movie");
  }
});
app.get("/countMovie/:lang", async function(req, res){
  try{
    const value = req.params.lang;
    const countMovies = await movieDB.countDocuments({language : value});
    const msg = `There are a total of ${countMovies} movies in ${value} language.` ;
    const data = await movieDB.find();
    res.render("index",{data,count:msg});
  }
  catch{
    
    res.send("Could not count the movies.");
  }
});
// const uname = "admin123";
// const pass = "abc@123"
// // Login page
// app.get("/login", function (req, res) {
//   res.render("login", { msg: "" });
// });

// app.post("/login", function (req, res) {
//   const { username, password } = req.body;
//   try{
//     if(username === uname){
//         if(pass === pass){
//             res.render("index", {user:"admin"});
//         }
//         else{
//             res.render("login", {msg:"Incorrect password"});
//         }
//         res.render("login", {msg:"Incorrect password"});
//     }

//   }
//   catch{
//     res.render("login",{msg:""});
//   }
 
// });


   

const start = () => {
  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });
};
start();