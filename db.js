exports = module.exports = {};
var main = require('./main.js');
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
    entryNum: Number,
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
    entryNum: Number,
    month: String, // M
    day: String, // D
    year: String, // YYYY
    amount: Number,
    cc: {type: String, enum: ["DD"]},
    mop: {type: String, enum: ["CH", "S"]},
    monthStart: String, // M
    dayStart: String, // D
    yearStart: String, // YYYY
    monthEnd: String, // M
    dayEnd: String, // D
    yearEnd: String, // YYYY

});
// Store list of users
var userSchema = new Schema({
    email: String,
    entriesCount: Number,
    creditCount: Number,
    first_name: String,
    last_name: String,
    password: String,
    capsIncome: Number,
    capsSavings: Number,
    capsFood: Number,
    capsRent: Number,
    capsPersonal: Number,
    capsEntertainment: Number,
    capsSchool: Number,
    capsMisc: Number,
    capsProjects: Number
});

// CREATE AND SAVE A MODEL //
// Compile model from schema
var entriesModel = mongoose.model('EntriesModel', entriesSchema);
var creditModel = mongoose.model('CreditModel', creditSchema);
var userModel = mongoose.model('UserModel', userSchema);

// Intialize User (Signup)
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
                password: main.sha256(pass),
                capsSavings: 0,
                capsFood: 0,
                capsRent: 0,
                capsPersonal: 0,
                capsEntertainment: 0,
                capsSchool: 0,
                capsMisc: 0,
                capsProjects: 0
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
// Login User (Login)
exports.login = function(email, pass, res){
    var hashed_pass = main.sha256(pass);
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

// Render Dashboard
exports.getDashboardData = function(email, res){
    var month = main.getCurrentTime("month");
    var year = main.getCurrentTime("year");
    console.log("MONTH: ", month);
    console.log("YEAR: ", year);
    entriesModel.find({ "month": month, "year": year, "email": email }, '', function (err, results) {
        userModel.findOne({ "email": email }, '', function(err, userResults){
            // Return data for dashboard
            var renderObj = {
                I: 0,
                E: 0,
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
                expenses: renderObj.E.toFixed(2),
                income: renderObj.I.toFixed(2),
                savings: renderObj.savings.toFixed(2),
                food:  renderObj.food.toFixed(2),
                rent:  renderObj.rent.toFixed(2),
                personal: renderObj.personal.toFixed(2),
                entertainment: renderObj.entertainment.toFixed(2),
                school: renderObj.school.toFixed(2),
                miscellaneous: renderObj.miscellaneous.toFixed(2),
                projects: renderObj.projects.toFixed(2),
                savingsPer: ((renderObj.savings / (userResults.capsSavings * 1.0)) * 100).toFixed(0),
                foodPer:  ((renderObj.food / (userResults.capsFood * 1.0)) * 100).toFixed(0),
                rentPer:  ((renderObj.rent / (userResults.capsRent * 1.0)) * 100).toFixed(0),
                personalPer: ((renderObj.personal / (userResults.capsPersonal * 1.0)) * 100).toFixed(0),
                entertainmentPer: ((renderObj.entertainment / (userResults.capsEntertainment * 1.0)) * 100).toFixed(0),
                schoolPer: ((renderObj.school / (userResults.capsSchool * 1.0)) * 100).toFixed(0),
                miscellaneousPer: ((renderObj.miscellaneous / (userResults.capsMisc * 1.0)) * 100).toFixed(0),
                projectsPer: ((renderObj.projects / (userResults.capsProjects * 1.0)) * 100).toFixed(0),
            });
        });  
    });
}
// Render Customization Page
exports.getCustomizationCaps = function(email, res){
    userModel.findOne({ "email": email }, '', function (err, results) {
        res.render('customization', {
            caps: {
                savings: results.capsSavings,
                food: results.capsFood,
                rent: results.capsRent,
                personal: results.capsPersonal,
                entertainment: results.capsEntertainment,
                school: results.capsSchool,
                miscellaneous: results.capsMisc,
                projects: results.capsProjects
            }
        });
    });
}
// Render view-entries page
exports.renderViewEntries = function(email, res){
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthInt = main.getCurrentTime("month");
    var month = months[monthInt - 1];
    var year = main.getCurrentTime("year");
    // Get entries data
    entriesModel.find({ "email": email, "year": year }, '', function (err, eResults) {
        if (err != null){
            response = {
                'error': 1,
                'Message': "Error on getting entries data (" + err + ")"
            }
            res.status(200).send(response);
        } else {
            monthResults = [];
            yearResults = [];
            eResults.forEach(function(result){
                if (result.month == monthInt){
                    monthResults.push({
                        id: result.entryNum,
                        date: result.year + "-" + result.month + "-" + result.day,
                        amount: result.amount,
                        ie: result.ie,
                        type: result.type,
                        mop: result.mop,
                        comp: result.company,
                        desc: result.desc
                    });
                }
                yearResults.push({
                    id: result.entryNum,
                    date: result.year + "-" + result.month + "-" + result.day,
                    amount: result.amount,
                    ie: result.ie,
                    type: result.type,
                    mop: result.mop,
                    comp: result.company,
                    desc: result.desc
                });
            });
            // Get credit entries data
            creditModel.find({ "email": email, "year": year }, '', function (errCred, cResults) {
                if (errCred != null){
                    response = {
                        'error': 1,
                        'Message': "Error on getting credit entries data (" + errCred + ")"
                    }
                    res.status(200).send(response);
                }
                creditResults = [];
                cResults.forEach(function(cResult){
                    creditResults.push({
                        id: cResult.entryNum,
                        date: cResult.year + "-" + cResult.month + "-" + cResult.day,
                        amount: cResult.amount,
                        cc: cResult.cc,
                        mop: cResult.mop,
                        startDate: cResult.yearStart + "-" + cResult.monthStart + "-" + cResult.dayStart,
                        endDate: cResult.yearEnd + "-" + cResult.monthEnd + "-" + cResult.dayEnd,
                    });
                });
                // Render view-entries file
                res.render('view-entries', {
                    active: "View Entries",
                    month: month,
                    year: year,
                    yearEntries: yearResults,
                    monthEntries: monthResults,
                    creditEntries: creditResults
                })
            });
        }
    });
}

// Create entry into the entries model DB
exports.createEntry = function(email, day, month, year, ie, amount, mop, desc, type, country, company, res){
    userModel.find({ "email": email }, '', function (err, results) {
        var newCount = results[0].entriesCount + 1;
        entriesModel.create({
            email: email,
            entryNum: newCount,
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
        }, function (err, resultCreate) {
            if (err == null){
                userModel.update({ "email": email }, {$set: {"entriesCount": (newCount)}},
                    function(err, resultUser){
                        if (resultUser.nModified !== 1){
                            response = {
                                'error': 1,
                                'Message': "Error updating user profile entry count (" + err + ")"
                            }
                            res.status(200).send(response);
                        } else {
                            response = {
                                'error': 0,
                                'Message': "Successfully created entry"
                            }
                            res.status(200).send(response);
                        }
                    }
                );
            } else {
                response = {
                    'error': 1,
                    'Message': "Error updating user profile (" + err + ")"
                }
                res.status(200).send(response);
            }
        });
    });
}
// Create entry into the entries model DB
exports.createCreditEntry = function(email, day, month, year, amount, mop, cc, dayStart, monthStart, yearStart,
    dayEnd, monthEnd, yearEnd, res){
    userModel.find({ "email": email }, '', function (err, results) {
        var newCount = results[0].creditCount + 1;
        creditModel.create({
            email: email,
            entryNum: newCount,
            month: month, // M
            day: day, // D
            year: year, // YYYY
            amount: amount,
            cc: cc,
            mop: mop,
            monthStart: monthStart, // M
            dayStart: dayStart, // D
            yearStart: yearStart, // YYYY
            monthEnd: monthEnd, // M
            dayEnd: dayEnd, // D
            yearEnd: yearEnd // YYYY
        }, function (err, resultCreate) {
            if (err == null){
                userModel.update({ "email": email }, {$set: { "creditCount": newCount }},
                    function(err, resultUser){
                        if (resultUser.nModified !== 1){
                            response = {
                                'error': 1,
                                'Message': "Error updating user profile credit count (" + err + ")"
                            }
                            res.status(200).send(response);
                        } else {
                            response = {
                                'error': 0,
                                'Message': "Successfully created credit entry"
                            }
                            res.status(200).send(response);
                        }
                    }
                );
            } else {
                response = {
                    'error': 1,
                    'Message': "Error updating user profile (" + err + ")"
                }
                res.status(200).send(response);
            }
        });
    });
}
// Update customization caps
exports.updateCustomization = function(email, caps, res){
    userModel.update({ "email": email }, {$set: { 
        "capsSavings": caps.savings,
        "capsFood": caps.food,
        "capsRent": caps.rent,
        "capsPersonal": caps.personal,
        "capsEntertainment": caps.entertainment,
        "capsSchool": caps.school,
        "capsMisc": caps.miscellaneous,
        "capsProjects": caps.projects
    }},
        function(err, resultUser){
            if (resultUser.nModified === 0){
                response = {
                    'error': 1,
                    'Message': "No rows were updated"
                }
                res.status(200).send(response);
            } else if (resultUser.nModified === 1){
                response = {
                    'error': 0,
                    'Message': "Successfully updated customization caps"
                }
                res.status(200).send(response);
            } else {
                response = {
                    'error': 0,
                    'Message': "Error updating customization caps (" + err + ")"
                }
                res.status(200).send(response);
            }
        }
    );
}