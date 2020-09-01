// require npm packages 
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// create route for user to have access to app
require('dotenv').config()

const PORT = process.env.PORT || 8000;

const app = express();

app.use(logger("dev"));

app.use(compression());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set('port', PORT);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/budget', {
 useNewUrlParser: true,
 useFindAndModify: false,
 useUnifiedTopology: true
});

// routes
app.use(require("./routes/api.js"));
app.listen(PORT, () => {
 console.log(`App running on port ${PORT}!`);
});


