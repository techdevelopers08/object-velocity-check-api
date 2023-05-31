require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var multer = require('multer');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var AuthRoutes = require('./routes/authentication');
var UsersRoutes = require('./routes/users');
var VideoRoutes = require('./routes/video');
var ChatRoutes = require('./routes/chat');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1/', indexRouter);
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/users', UsersRoutes);
app.use('/api/v1/video', VideoRoutes);
app.use('/api/v1/chat', ChatRoutes);

const socket = require('socket.io');

let serverpot = app.listen(process.env.APP_PORT, function () {
    console.log('App Server is running on  !' + process.env.APP_PORT)
})


var io = require('socket.io')(serverpot);
io.on('connection', function (socket) {
    console.log(' 👍 💯 👍 💯 👍 💯 client connected! 👍 💯 👍 💯 👍 💯 ');
      // Error reporting
      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });
      socket.on('error', function (err) {
        console.log("  👎 😧 👎 😧 👎 😧 👎 😧 Socket.IO Error....!! 👎 😧 👎 😧 👎 😧 👎 😧");
        console.log(err.stack);
      });
      socket.on('disconnect', function() {
        // redisClient.quit();
        console.log(' 👎 😧 👎 😧 👎 😧 👎 😧 Client disconnected...!! 👎 😧 👎 😧 👎 😧 👎 😧');
      });
  });

app.set("io", io);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    // next(createError(404));
    res.status(404).json({
        'success': false,
        'code': 404,
        'message': "Some error occur please try again",
        'body': {}
    });
});

// error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'locals' ? err : {};
    console.log(err);
    res.status(err.status || 500);
    res.render('error');
});



module.exports = app;
