var api = require('./api.js');
var db = require('./db.js');

api.app.use(api.express.static(api.path.join(__dirname, 'public')));
// app.use(cors());
/* Use body-parser */
api.app.use(api.bodyParser.json());
api.app.use(api.bodyParser.urlencoded({ extended: false }));

api.app.set('view engine', 'ejs');

// At root route render index.ejs
api.app.get('/', function(req, res){
    db.getDashboardData("n2rosari@edu.uwaterloo.ca", res);
});
api.app.get('/dashboard.ejs', function(req, res){
    db.getDashboardData("n2rosari@edu.uwaterloo.ca", res);
});

// Pages (Single element in render object)
api.app.get('/add-entries.ejs', function(req, res){
    res.status(200).render('add-entries', { active: "Add Entries" });
});
api.app.get('/notifications.ejs', function(req, res){
    res.status(200).render('notifications', { active: "Notifications" });
});
api.app.get('/customization.ejs', function(req, res){
    res.status(200).render('customization', { active: "Customization" });
});
api.app.get('/user.ejs', function(req, res){
    res.status(200).render('user', { active: "User Profile" });
});
api.app.get('/login.ejs', function(req, res){
    res.status(200).render('login', { active: "Login" });
});
api.app.get('/signup.ejs', function(req, res){
    res.status(200).render('signup', { active: "Signup" });
});
// Pages (Multiple elements in the render object)
api.app.get('/view-entries.ejs', function(req, res){
    res.status(200).render('view-entries', {
        active: "View Entries",
        month: "March",
        year: "2018",
        entries: [{
            "id": 1,
            "date": "2018-03-01",
            "ie": "E",
            "amount": 90,
            "mop": "CC",
            "desc": "Description"
        },{
            "id": 2,
            "date": "2018-03-01",
            "ie": "I",
            "amount": 100,
            "mop": "CH",
            "desc": "Description"
        }],
        ccEntries: [{
            "id": 1,
            "date": "2018-03-01",
            "amount": 90,
            "cc": "Double Double",
            "mop": "CH"
        },{
            "id": 2,
            "date": "2018-03-01",
            "ie": "I",
            "amount": 100,
            "cc": "Double Double",
            "mop": "CH",
        }]
    });
});
api.app.get('/reports.ejs', function(req, res){
    res.status(200).render('reports', {
        active: "Reports",
        month: "March",
        year: "2018"
    });
});
// Documentation
api.app.get('/info', function(req, res){
    res.status(200).render('documentation', { active: "User Profile" });
});


// On User Login
api.app.post('/post-login', function(req, res){
    var email = req.body.email;
    var pass = req.body.pass;
    db.login(email, pass, res);
});
// On User Signup
api.app.post('/post-signup', function(req, res){
    var fName = req.body.fName;
    var lName = req.body.lName;
    var email = req.body.email;
    var pass = req.body.pass;
    db.signup(fName, lName, email, pass, res);
});
// Create entry
api.app.post('/post-add-entry', function(req, res){
    var body = req.body;
    var email = body.email;
    var day = body.day;
    var month = body.month;
    var year = body.year;
    var ie = body.ie;
    var amount = body.amount;
    var mop = body.mop;
    var desc = body.desc;
    var type = body.type;
    var country = body.country;
    var company = body.company;
    db.createEntry(email, day, month, year, ie, amount, mop, desc, type, country, company, res);
});

api.app.listen(7000, function () {
    console.log('Example app listening on 7000');
});
    
    