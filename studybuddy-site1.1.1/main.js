//This is the main express/nodejs file that will run much of the site
//
//If you are inspecting element in the browser for this site, fuck off this ain't yo property homie
//

//configuration---------------------------------
//require segment for configuration
var express = require('express');
var app = express();
var formidable = require('formidable');

    //vulnerability patch for security
    app.disable('x-powered-by');
    //express handlebars require
    var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
    app.engine('handlebars', handlebars.engine);
    app.set('view engine', 'handlebars');
    //body-parser require
    app.use(require('body-parser').urlencoded({
        extended: true
    }));
    //cookies for security
    var credentials = require('./credentials.js');
    app.use(require('cookie-parser')(credentials.cookieSecret));

    //port setup and directory referencing for public files
    app.set('port', process.enf.PORT || 80);
    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/public/style.css'));
//----------------------------------------------

//url rendering---------------------------------
//render homepage
app.get('/', function(req, res){
    res.render('home');
});
//render login
app.get('/login', function(req, res){
    res.render('login')
});
//render tutor page
app.get('/table', function(req, res){
    res.render('table');
});
//render registry
app.get('/register', function(req, res){
    res.render('register');
});
//render settings
app.get('/settings', function(req, res){
    res.render('settings', {csrf: 'CSRF token here'});
});
//----------------------------------------------

//feedback email send---------------------------
app.post('/process', function(req, res){
    const mailer = require('nodemailer');
    const smtp = require('nodemailer-smtp-transport');
    async function mailjet(){
            const transport = mailer.createTransport(
                    smtp({
                            host: 'in.mailjet.com',
                            port: 2525,
                            auth: {
                                    user:   process.env.MAILJET_API_KEY || '9ab14aa0e$
                                    pass: process.env.MAILJET_API_SECRET || '8662e2$
                            },
                    })
            );
            const json = await transport.sendMail({
                    from: 'fhs.studybuddies@gmail.com',
                    to: 'fhs.studybuddies@gmail.com',
                    subject: req.body.email,
                    text: req.body.ques,
            });
        console.log(json);
    }
    mailjet();
});
//----------------------------------------------

//file upload-----------------------------------
app.get('/profile-edit', function(req, res){
    var now = new Date();
    res.render('profile-edit', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
});
app.post('/profile-edit/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, functon(err, fields, file){
        if(err)
            return res.redirect(303, '/errors');
        console.log('Received an Image');
        console.log(file);
        res.redirect(303, '/thankyou');
    });
});
//----------------------------------------------

//error pages for session failure---------------
app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.render('404');
});
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});
//----------------------------------------------

//listen to port--------------------------------
app.listen(app.get('port'), function(){
    console.log('Express started on https://www.study-buddies.net : port ' + app.get('port') + 'press Ctrl-C to terminate');
});
//----------------------------------------------