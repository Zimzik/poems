var express     = require('express');
var app         = express();
var pass        = require('path');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose user model
var Poem        = require('./app/models/poem'); // get the mongoose poem model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
var jade        = require('jade');
var moment      = require('moment');
 
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());

app.use(express.static(__dirname + '/views'));
 
// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.sendFile('index.html');
});
 
// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();
 
// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successfully created new user.'});
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!', user: user.name});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

apiRoutes.post('/savePoem', function(req, res) {
  let newPoem = new Poem({
    title: req.body.title,
    body: req.body.body,
    date: req.body.date
  });
  
  newPoem.save(function(err) {
    if (err) {
      console.log(err);
      res.json({success: false});
    } else {
      console.log("Data saved on db");
      res.json({success: true, msg: "Data has been saved on db!"})
    }
  })
});

apiRoutes.post('/poemsList', function(req, res) {
  Poem.find(function(err, poems) {
    if (err) {
      console.log(err);
    } else {
      console.log(poems);
      let newList = poems.map(function(el) {
        /*let date = new Date(el.date);*/
        el.date = moment(el.date).format('YYYY-DD-MM');
        return el;
      });
      res.json({success: true, poemsList: newList});
    }
  })
})
               
               
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
 
// connect the api routes under /api/*
app.use('/api', apiRoutes);
// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);