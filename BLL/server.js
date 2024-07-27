'use strict';
var port = process.env.PORT || 1337;
var express = require('express');
var session = require("express-session");
var cookieParser = require('cookie-parser');
var app = express();
var path = require('path');
const userManager = require('./UserManager');
const ItemManager = require('./ItemManager');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../PL/Views/home.html'));
  });

app.use('/Scripts', express.static(path.join(__dirname, '../PL/Scripts')));
app.use('/Styles', express.static(path.join(__dirname, '../PL/Styles')));
app.use('/', express.static(path.join(__dirname, '../PL/Views')));
app.use('/', express.static(path.join(__dirname, '../PL/Assets')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
}));

app.use('/', userManager);
app.use('/', ItemManager);


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(port);
