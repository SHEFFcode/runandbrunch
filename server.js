var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var PORT = process.env.PORT || 7000;
var Yelp = require('yelp');
var runners =	require('./routes/runners');
var runs = require('./routes/runs');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

app.get('/json', function(req, res) {
	(function(i){

    	//Set up yelp connection
    	var yelp = new Yelp({
    		consumer_key: 'jqzRyorgPw4t4nQ3StcSww',
    		consumer_secret: 'FlcrIHmnpG-o8QO9ot8esXECHck',
    		token: 'kO8VNBs0taiSBbwIJCIDTyuvMdciy_Sl',
    		token_secret: 'x85zJHByyXnjGxg1M91wnPEm9MU',
    	});

		// See http://www.yelp.com/developers/documentation/v2/search_api
		yelp.search({ term: 'brunch', ll: '37.77493, -122.419415', limit: 5, sort: 1 })
		.then(function (data) {
			res.send(data);
		})
		.catch(function (err) {
			console.error(err);
		});

	})();

});


//Google Authentication

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new GoogleStrategy({
    clientID: '141240246742-scoggs7ot72a8lob81jpspv9v9ap0s3q.apps.googleusercontent.com',
    clientSecret: 'QWJRpmIZ-WJNa4yXUBHvP38Z',
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

//Mongoose Connection
mongoose.connect('mongodb://sheff:123@ds019839.mlab.com:19839/runandbrunch');
var db = mongoose.conneciton;

//specify a static directory for express to use
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.json());

//Routes
app.use('/api/runners', runners);
app.use('/api/runs', runs);

app.get('/', function(req, res) {
	res.send('Hello world');
});

app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return',
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/login' }));







app.listen(PORT);
console.log('Server started on port ....' + PORT);