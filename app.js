const express = require("express");
const app = express();

// ----------------------------------------
// ENV
// ----------------------------------------
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ----------------------------------------
// Template Engine
// ----------------------------------------
const expressHandlebars = require("express-handlebars");

const hbs = expressHandlebars.create({
  extname: '.hbs',
  partialsDir: "views/",
  defaultLayout: "main"
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// ----------------------------------------
// Mongoose
// ----------------------------------------
const mongoose = require("mongoose");
app.use((req, res, next) => {
  if (mongoose.connection.readyState) {
    next();
  } else {
    require("./mongo")(req).then(() => next());
  }
});

// ----------------------------------------
// Sessions
// ----------------------------------------
const expressSession = require('express-session');
app.use(
  expressSession({
    secret: process.env.secret || "puppies",
    saveUninitialized: false,
    resave: false
  })
);

// ----------------------------------------
// Body Parser
// ----------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


// ----------------------------------------
// Method Override
// ----------------------------------------
app.use((req, res, next) => {
  let method;
  if (req.query._method) {
    method = req.query._method;
    delete req.query._method;
    for (let key in req.query) {
      req.body[key] = decodeURIComponent(req.query[key]);
    }
  } else if (typeof req.body === "object" && req.body._method) {
    method = req.body._method;
    delete req.body._method;
  }

  if (method) {
    method = method.toUpperCase();
    req.method = method;
  }

  next();
});

// ----------------------------------------
// Logging
// ----------------------------------------
const morgan = require("morgan");
const highlight = require("cli-highlight").highlight;

// Add :data format token
// to `tiny` format
let format = [
  ":separator",
  ":newline",
  ":method ",
  ":url ",
  ":status ",
  ":res[content-length] ",
  "- :response-time ms",
  ":newline",
  ":newline",
  ":data",
  ":newline",
  ":separator",
  ":newline",
  ":newline"
].join("");

// Use morgan middleware with
// custom format
app.use(morgan(format));

// Helper tokens
morgan.token("separator", () => "****");
morgan.token("newline", () => "\n");

// Set data token to output
// req query params and body
morgan.token("data", (req, res, next) => {
  let data = [];
  ["query", "params", "body", "session"].forEach(key => {
    if (req[key]) {
      let capKey = key[0].toUpperCase() + key.substr(1);
      let value = JSON.stringify(req[key], null, 2);
      data.push(`${capKey}: ${value}`);
    }
  });
  data = highlight(data.join("\n"), {
    language: "json",
    ignoreIllegals: true
  });
  return `${data}`;
});

//--------------------------------
//Restore user session
//-------------------------------
const getUserInfo = require('./services/getUserInfo');
app.use(getUserInfo);


// ----------------------------------------
// Routes
// ----------------------------------------
app.get('/photos/new', (req, res) => {
  res.render('photos/new');
});

const FileUploader = require("./services/fileUpload");
const mw = FileUploader.single('photo[file]');

app.post("/photos", mw, (req, res, next) => {
    //file contents should be at req.file as per multer middleware
    console.log("req.file data", req.file);
    //create file object with data
    FileUploader.upload({
        data: req.file.buffer,
        name: req.file.originalname,
        mimetype: req.file.mimetype
    })
    .then((response) => {
        res.redirect('/photos');
    })
    .catch(next);
});

app.delete("/photos/:id", (req, res, next) => {
    let id = req.params.id;

    FileUploader.remove(id)
    .then(() => {
        res.redirect('/photos');
    })
    .catch(next);
});

app.get(['/', '/photos'], (req, res, next) => {
    res.render('photos/index');
});

const loginRouter = require('./routers/login');
app.use('/login', loginRouter);

// ----------------------------------------
// Server
// ----------------------------------------
const port = process.env.PORT || process.argv[2] || 3000;
const host = "localhost";

let args;
process.env.NODE_ENV === "production" ? (args = [port]) : (args = [port]);

args.push(() => {
  console.log(`Listening: http://${host}:${port}\n`);
});

app.listen.apply(app, args);

// ----------------------------------------
// Error Handling
// ----------------------------------------
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.stack) {
    err = err.stack;
  }
  res.status(500).render("errors/500", { error: err });
});
