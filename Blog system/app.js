var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var moment = require('moment');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })

var expressValidator = require('express-validator');


var mongo = require('mongodb');

var db = require('monk')('localhost/ndoeblog');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Expresss Session 
app.use(session({
  secret:'secret',
  saveUninitialized : true,
  resave : true

}));

// Express Validator 
app.use(expressValidator({
  errorFormatter:function(params,msg,value){
    var namespace = param.split('.')
    ,root = namespace.shift()
    ,formParam = root;

    while(namespace.length) {
      formParam  +=  '[' + namespace.shift() + ']';
    }
    return {
      param:formParam,
      msg:msg,
      value:value
    }; 
  }
}));

//Connect- Flash
app.use(require('connect-flash')());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
})


// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;