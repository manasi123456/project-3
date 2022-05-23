// const express = require("express");
// var bodyParser = require("body-parser");

// const route = require("./routes/route");
// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://lddu818:27o3D6VwW2z1zHMj@cluster0.6gomf.mongodb.net/group11Database",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err));

// app.use("/", route);

// app.listen(process.env.PORT || 3000, function () {
//   console.log("Express app is running on " + " " + (process.env.PORT || 3000));
// });

const express = require('express');
var bodyParser = require('body-parser');

const route = require('./routes/route.js');

const app = express();

const multer= require("multer");
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( multer().any())

app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});