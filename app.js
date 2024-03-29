//1. EXPRESS
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
const os = require('os'); 
const fileUpload = require('express-fileupload');

// view engine setup - Serve static files from the 'public' directory
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//2. DATABASE MongoDB CONNECTIONS
//Add connection string from Config file
const config = require("./config/globals");
let connectionString = config.db;
var mongoose = require("mongoose");
//Configure mongoose (initial database connection)
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((message) => {
    console.log("Connected successfully!");
  }) //do something after connecting
  .catch((error) => {
    console.log(`Error while connecting! ${error}`);
  }); //catch any errors

//3. AUTHENTICATION
var passport = require("passport");
var session = require("express-session");
const githubStrategy = require("passport-github2").Strategy;
var User = require("./models/user"); 

//Configure session handling
app.use(
  session({
    secret: "speciesTracker",
    resave: false,
    saveUninitialized: false,
  })
);
//Configure passport module
app.use(passport.initialize());
app.use(passport.session());
//Configure local strategy method
passport.use(User.createStrategy()); 
// Configure passport-github2 with the API keys and user model
passport.use(
  new githubStrategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({ oauthId: profile.id });
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          username: profile.username,
          oauthId: profile.id,
          oauthProvider: "Github",
          created: Date.now(),
        });
        // add to DB
        const savedUser = await newUser.save();
        return done(null, savedUser);
      }
    }
  )
);
//Set passport to write/read user data to/from session object 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 4. ROUTER and API ('/', indexRouter)
var indexRouter = require('./routes/index');
var blogsRouter = require('./routes/blogs');
var plantsRouter = require("./routes/plants");
var fungiRouter = require("./routes/fungi");
var animalsRouter = require("./routes/animals");
var protistsRouter = require("./routes/protists");

app.use('/', indexRouter);
app.use('/blogs', blogsRouter);
app.use('/plants', plantsRouter);
app.use("/fungi", fungiRouter);
app.use('/animals', animalsRouter);
app.use("/protists", protistsRouter);

//IDENTIFY PLANT (PlantNet)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
// Configure express-fileupload to use a temporary directory
app.use(fileUpload({ useTempFiles: true, tempFileDir: os.tmpdir() }));
app.post('/identify', async (req, res) => {
  const project = 'all?include-related-images=false&no-reject=false&lang=en&type=kt';
  const apiKey = config.plantNetAPI;
  const apiUrl = `https://my-api.plantnet.org/v2/identify/${project}&api-key=${apiKey}`;
  const formData = new FormData();
  // Use req.files.image to access the uploaded file  
  const file = req.files.image;
  console.log(apiUrl);
  console.log('file', file);
  // Make sure file is not empty
  if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
  }
  console.log('file.tempFilePath', file.tempFilePath);
  const fileStream = fs.createReadStream(file.tempFilePath);
  console.log('fileStream', fileStream);
  formData.append('images', fileStream, { filename: file.name });
  try {
      const response = await axios.post(apiUrl, formData, {
          headers: {
              ...formData.getHeaders(),
          },
      });
      // Extract information about the first match
      const firstMatch = response.data.results && response.data.results[0];
    
      // Send back detailed information to the client
      res.status(response.status).json({
          status: response.status,
          bestMatch: response.data.bestMatch,
          firstMatch: firstMatch,
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(error.response?.status || 500).json({ message: error.message });
  }
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;