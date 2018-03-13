exports = module.exports = {};
var api = require('./api.js');
// REQUIRED NODE MODULES //
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
// DECLARE MONGODB AND MONGOOSE //
var mongoDB = "mongodb://finance:finance_Nicole@finance-shard-00-00-jjlqo.mongodb.net:27017,finance-shard-00-01-jjlqo.mongodb.net:27017,finance-shard-00-02-jjlqo.mongodb.net:27017/test?ssl=true&replicaSet=finance-shard-0&authSource=admin";
mongoose.connect(mongoDB);
// SETUP MONGOOSE //
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// DEFINE A SCHEMA //
var Schema = mongoose.Schema;

// Stores entries 
var entriesSchema = new Schema({
    email: String,
    id: Number,
    month: String, // Make YYYY-MM-DD
    day: String, // Make YYYY-MM-DD
    year: String, // Make YYYY-MM-DD
    ie: {type: String, enum: ["I", "E"]},
    amount: Number,
    mop: {type: String, enum: ["CC", "CH", "S", "C"]},
    desc: String,
    type: {type: String, enum: ["income", "savings", "food", "rent", "personal", "entertainment",
        "school", "miscellaneous", "projects"]},
    country: String,
    company: String
});
// Store entries of credit card payments
var creditSchema = new Schema({
    email: String,
    id: Number,
    month: String, // Make YYYY-MM-DD
    day: String, // Make YYYY-MM-DD
    year: String, // Make YYYY-MM-DD
    amount: Number,
    cc: {type: String, enum: ["DD"]},
    mop: {type: String, enum: ["CC", "CH", "S", "C"]}
});
// Store list of users
var userSchema = new Schema({
    email: String,
    entriesCount: Number,
    creditCount: Number,
    first_name: String,
    last_name: String,
    password: String
});

// CREATE AND SAVE A MODEL //
// Compile model from schema
var entriesModel = mongoose.model('EntriesModel', entriesSchema);
var creditModel = mongoose.model('CreditModel', creditSchema);
var userModel = mongoose.model('UserModel', userSchema);

// Intialize User
exports.signup = function(fName, lName, email, pass, res){
    // Check if user with email already exists
    userModel.findOne({ "email": email }, '', function (err, results) {
        if (results != null){ // Email already exists
            response = {
                'error': 2,
                'Message': "Email already exists"
            }
            res.status(200).send(response);
        } else if (err != null){ // Error
            response = {
                'error': 1,
                'Message': "Error on signup"
            }
            res.status(200).send(response); 
        } else { // Create user
            userModel.create({
                email: email,
                entriesCount: 0,
                creditCount: 0,
                first_name: fName,
                last_name: lName,
                password: api.sha256(pass)
            }, function (err, result) {
                if (err){
                    response = {
                        'error': 1,
                        'Message': err
                    }
                } else{
                    response = {
                        'error':0,
                        'Message': "Successfully created user"
                    }
                }
                res.status(200).send(response);
            });
        }
    });
}
// Login
exports.login = function(email, pass, res){
    var hashed_pass = api.sha256(pass);
    userModel.findOne({ "email": email }, '', function (err, results) {
        if (hashed_pass === results.password){
            response = {
                'error': 0,
                'Message': "Logged in successfully",
                'data': {
                    'fName': results.first_name,
                    'lName': results.last_name,
                    'email': email
                }
            }
            res.status(200).send(response);
        } else { // Email and password don't match
            response = {
                'error': 2,
                'Message': "Email and username don't match"
            }
            res.status(200).send(response);
        }
    });
}

exports.getDashboardData = function(email, res){
    // var month = api.getCurrentTime("month");
    // var year = api.getCurrentTime("year");
    var month = "04";
    var year = "2018";
    entriesModel.find({ "month": month, "year": year, "email": email }, '', function (err, results) {
        // Return data for dashboard
        console.log(results);
        var renderObj = {
            I: 0,
            E: 0,
            income: 0,
            savings: 0,
            food: 0,
            rent: 0,
            personal: 0,
            entertainment: 0,
            school: 0,
            miscellaneous: 0,
            projects: 0
        }
        results.forEach(function(result){
            renderObj[result.type] += result.amount; // Type
            renderObj[result.ie] += result.amount; // Income or expense
        });
        res.status(200).render("index", {
            active: "Dashboard",
            expenses: renderObj.E,
            income: renderObj.I,
            savings: renderObj.savings,
            food:  renderObj.food,
            rent:  renderObj.rent,
            personal: renderObj.personal,
            entertainment: renderObj.entertainment,
            school: renderObj.school,
            miscellaneous: renderObj.miscellaneous,
            projects: renderObj.projects
        });
    });
}

// Create entry into the entries model DB
exports.createEntry = function(email, day, month, year, ie, amount, mop, desc, type, country, company, res){
    userModel.find({ "email": email }, '', function (err, results) {
        console.log(results);
        entriesModel.create({
            email: email,
            id: results.entriesCount,
            month: month,
            day: day,
            year: year,
            ie: ie,
            amount: amount,
            mop: mop,
            desc: desc,
            type: type,
            country: country,
            company: company
        }, function (err, result) {
            console.log(result);
            if (err){
                response = {
                    'error': 1,
                    'Message': err
                }
                res.status(200).send(response);
            } else{
                response = {
                    'error':0,
                    'Message': "Successfully created entry"
                }
                res.status(200).send(response);
            }
        });
    });
}




exports.createSession = function(name, idClass, res){
    // Generate random ID string
    api.sessionIDLast = id;
    var response;
    classModel.create({
        className: name,
        classID: idClass
    }, function (err, result) {
        if (err){
            response = {
                'error': 1,
                'Message': err
            }
        } else{
            response = {
                'error':0,
                'Message': {
                    'message': "Successfully created session",
                    'ID': id
                }
            }
        }
        res.status(200).render('index_prof', {
            slowDownCount: 0,
            slowDownPercent: 0
        });
    });
}

exports.createClass = function(name, user, res){ // classListModel
    var idClass = name.replace(/\s/g, '');
    var response;
    classListModel.create({ 
        className: name,
        classID: idClass,
        latestClassSessionID: null,
        record: 0
    }, function (err, result) {
        if (err){
            response = {
                'error': 1,
                'Message': err
            }
        } else{
            response = {
                'error':0,
                'Message': {
                    'message': "Successfully created class",
                    'ID': idClass
                }
            }
        }
        var render;
        if (user === 'prof'){ render = 'index_prof'; }
        else { render = 'index_student'; }
        res.status(200).render(render);
        // res.status(200).render(render, { class: name });
    });
}

exports.addAction = function(action, sessionID, res){ // classModel
    classModel.findOne({"classSessionID": sessionID}, function(err, results){
        console.log("Result: ", results);
        if (action === "speedUp"){
            var newVar = results.speedUpCount + 1;
            console.log(typeof newVar);
            console.log(newVar);
            classModel.update({"classSessionID": sessionID},{$set: {"speedUpCount": newVar }}, {"upsert": true},
        function(err, result){
            console.log("ERR: ", err);
            console.log("Results: ", result)
        });
        } else if (action === "slowDown"){
            var newVar = results.slowDownCount + 1;
            console.log(typeof newVar);
            console.log(newVar);
            classModel.update({"classSessionID": sessionID},{$set: {"slowDownCount": newVar }}, {"upsert": true},
        function(err, result){
            console.log("ERR: ", err);
            console.log("Results: ", result)
        });
        } else if (action === "louder"){
            var newVar = results.louderCount + 1;
            console.log(typeof newVar);
            console.log(newVar);
            classModel.update({"classSessionID": sessionID},{$set: {"louderCount": newVar }}, {"upsert": true},
        function(err, result){
            console.log("ERR: ", err);
            console.log("Results: ", result)
        });
        } else if(action === "quieter"){
            var newVar = results.quieterCount + 1;
            console.log(typeof newVar);
            console.log(newVar);
            classModel.update({"classSessionID": sessionID},{$set: {"quieterCount": newVar }}, {"upsert": true},
        function(err, result){
            console.log("ERR: ", err);
            console.log("Results: ", result)
        });
        }
        res.status(200).render('index_student',{
            //  EJS variables you need in student.ejs
            courseName: results.className,
            sessionID: sessionID
        });
    });
}

// Add adding message to class
exports.addMessage = function(message, sessionID, sender, avatar, res){
    var time = api.getCurrentTime();
    messagesModel.create({ 
        message: message,
        time: time,
        sessionID: sessionID,
        sender: sender,
        avatar: avatar
    }, function (err, result) {
        if (err){
            var response = {
                'error': 1,
                'Message': err
            };
        } else{
            var response = {
                'error': 0,
                'Message': "Added message successfully"
            };
        }
        res.status(200).send(response);
    });
}

exports.updateRecordStatus = function(newStatus, classID, res){
    if (classID === null || classID === undefined || classID === ''){ classID = api.classNameLast; }
    console.log("ClassID: ", classID);
    if (newStatus === 'false'){ newStatus = 0; } 
    else{ newStatus = 1; }
    console.log(newStatus);
    // Class
    classListModel.update({ "classID": classID }, {$set: { "record": newStatus }},
    function(err, result){
        console.log('------------ 1');
        console.log("Result: ", result);
        console.log("ClassID: ", classID);
    });
    // Session
    classModel.update({ "classID": classID }, {$set: { "recording": newStatus }},
    function(err, result){
        console.log('------------ 2');
        console.log("Result: ", result);
        console.log("ClassID: ", classID);
    });
    // Response
    var response = {
        'error': 0,
        'Message': 'Successfully updated record status'
    }
    res.status(200).send(response);
}

exports.refreshDashProf = function(sessionID, className, res){
    console.log("SessionID: ", sessionID);
    classModel.findOne({ 'classSessionID': sessionID }, '', function (err, result) {
        var response;
        if (err){
            response = {
                'error': 1,
                'Message': err
            }
            res.status(200).send(response);
        } else{
            response = {
                'error':0,
                'Message': result
            }
        }
        // console.log('Result: ', result);
        // console.log('Err: ', err);
        if (result !== undefined && result !== null){
            messagesModel.find({ 'sessionID': sessionID }, '', function (err, results) {
                if (err){
                    response = {
                        'error': 1,
                        'Message': err
                    }
                    res.status(200).send(response);
                } else{
                    response = {
                        'error':0,
                        'Message': results
                    }
                }
                // console.log('Results: ', results);
                // console.log('Err: ', err);
                if (result !== null && results.length > 0){
                    // Speed up, slow down, louder, quieter actions
                    var slowPercent, fastPercent, louderPercent, quietPercent;
                    if (result.slowDownCount === 0 && result.speedUpCount === 0){ 
                        slowPercent = 0;
                        fastPercent = 0;
                    }
                    else { 
                        slowPercent = parseInt(result.slowDownCount/(result.slowDownCount + result.speedUpCount) * 100);
                        fastPercent = parseInt(result.speedUpCount/(result.slowDownCount + result.speedUpCount) * 100);
                    }
                    if (result.louderCount === 0 && result.quieterCount === 0){ 
                        louderPercent = 0;
                        quietPercent = 0;
                    }
                    else { 
                        louderPercent = parseInt(result.louderCount/(result.louderCount + result.quieterCount) * 100);
                        quietPercent = parseInt(result.quieterCount/(result.louderCount + result.quieterCount) * 100);
                    }
                    // Messages
                    var messages = [];
                    results.forEach(function(message){
                        messages.splice(0, 0, {
                            name: message.sender,
                            text: message.message,
                            time: message.time,
                            avatar: message.avatar
                        });
                    });
                    res.status(200).render('index_prof', {
                        slowDownCount: result.slowDownCount,
                        slowDownPercent: slowPercent, 
                        speedUpCount: result.speedUpCount,
                        speedUpPercent: fastPercent,
                        louderCount: result.louderCount,
                        louderPercent: louderPercent,
                        quieterCount: result.quieterCount,
                        quieterPercent: quietPercent,
                        messages: messages,
                        updatedTime: api.getCurrentTime(),
                        courseName: className,
                        sessionID: sessionID
                    });
                } else {
                    // console.log('---------- SECOND ----------');
                    res.status(200).render('index_prof', {
                        slowDownCount: result.slowDownCount,
                        slowDownPercent: slowPercent, 
                        speedUpCount: result.speedUpCount,
                        speedUpPercent: fastPercent,
                        louderCount: result.louderCount,
                        louderPercent: louderPercent,
                        quieterCount: result.quieterCount,
                        quieterPercent: quietPercent,
                        messages: [],
                        updatedTime: api.getCurrentTime(),
                        courseName: className,
                        sessionID: sessionID
                    });
                }
            });
        } else {
            res.status(200).render('index_prof', {
                slowDownCount: 0,
                slowDownPercent: 0, 
                speedUpCount: 0,
                speedUpPercent: 0,
                louderCount: 0,
                louderPercent: 0,
                quieterCount: 0,
                quieterPercent: 0,
                messages: [],
                updatedTime: api.getCurrentTime(),
                courseName: className,
                sessionID: sessionID
            });
        }
    });
}

exports.refreshDashStudent = function(sessionID, className, res){
    console.log("Refresh student");
    classModel.findOne({ 'classSessionID': sessionID }, '', function (err, results) {
        // var courseName = results.className;
        res.status(200).render('index_student',{
            //  EJS variables you need in student.ejs
            courseName: className,
            sessionID: sessionID
        });
    });
}

exports.addMsgs = function(text, sender, avatar, sessionID, res){ // classModel
    messagesModel.findOne({"sessionID": sessionID}, function(err, results){
        console.log("Result: ", results);
            messagesModel.create({
                "sessionID": sessionID, 
                "message": text, 
                "sender": sender, 
                "avatar": avatar,
                "time": api.getCurrentTime(),
            }, function(err, result) {
                if (err){
                    response = {
                        'error': 1,
                        'Message': err
                    }
                } else{
                    response = {
                        'error':0,
                        'Message': "Successfully added message"
                    }
                }
                res.status(200).send(response);
        });
    });
}