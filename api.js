exports = module.exports = {};
var db = require('./db.js');
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var sha256 = require('sha256');

exports.express = express;
exports.app = app;
exports.path = path;
exports.bodyParser = bodyParser;
exports.sha256 = sha256;


exports.renderDashboard = function(res){
    db.getDashboardData("n2rosari@edu.uwaterloo.ca", res);
    // var results = {
    //     income: 100,
    //     savings: 10,
    //     food: 10,
    //     rent: 10,
    //     personal: 10,
    //     entertainment: 10,
    //     school: 10,
    //     miscellaneous: 10,
    //     projects: 10
    // }
    // res.status(200).render('index', {
    //     active: "Dashboard",
    //     expenses: results.savings + results.food + results.rent + results.personal + results.entertainment +
    //         results.school + results.miscellaneous + results.projects,
    //     income: results.income,
    //     savings: results.savings,
    //     food: results.food,
    //     rent: results.rent,
    //     personal: results.personal,
    //     entertainment: results.entertainment,
    //     school: results.school,
    //     miscellaneous: results.miscellaneous,
    //     projects: results.projects
    // });
}

// Get Time (or data based on parameter -> ie, if month is passed return month)
exports.getCurrentTime = function(data = ""){
    var dateTime = new Date();
    var hours, minutes, seconds;
    // Year, month, day
    if (data === "year"){ return dateTime.getFullYear(); }
    else if (data === "month"){ return dateTime.getMonth(); }
    else if (data === "day"){
        return parseInt(dateTime.getDate() > 9) ? dateTime.getDate() : "0" + dateTime.getDate();
    } else {
        hour = parseInt(dateTime.getHours() > 9) ? dateTime.getHours() : "0" + dateTime.getHours();
        minutes = parseInt(dateTime.getMinutes() > 9) ? dateTime.getMinutes() : "0" + dateTime.getMinutes();
        seconds = parseInt(dateTime.getSeconds() > 9) ? dateTime.getSeconds() : "0" + dateTime.getSeconds();
    }
    // Hours, minutes, seconds
    if (data === "hours"){
        return hours;
    } else if (data === "minutes"){
        return minutes;
    } else if (data === "seconds"){
        return seconds;
    }
    return hour + ":" + minutes + ":" + seconds;
}

