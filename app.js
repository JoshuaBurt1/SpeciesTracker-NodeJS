//1. EXPRESS
var createError = require('http-errors');
var express = require('express');
const multer = require('multer');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();

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



//4. ROUTER
var indexRouter = require('./routes/index');
var plantsRouter = require("./routes/plants"); //required for add, edit, delete route changes
var fungiRouter = require("./routes/fungi"); //required for add, edit, delete route changes
var animalsRouter = require("./routes/animals"); //required for add, edit, delete route changes
var protistsRouter = require("./routes/protists"); //required for add, edit, delete route 

app.use('/', indexRouter);
app.use('/plants', plantsRouter); //required for add, edit, delete route changes
app.use("/fungi", fungiRouter); //required for add, edit, delete route changes
app.use('/animals', animalsRouter); //required for add, edit, delete route changes
app.use("/protists", protistsRouter); //required for add, edit, delete route changes

//ROUTING ERRORS
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;