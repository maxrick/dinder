// var express = require('express'),
// app = express(),
// //port = process.env.PORT || 3000,

// port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
// ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
// dbService = process.env.DATABASE_SERVICE_NAME || 'mongodb'
// mongoHost =  process.env.MONGODB_SERVICE_HOST || '127.0.0.1',
// db_name = process.env.MONGODB_DATABASE || 'dinderdb',
// db_user = process.env.MONGODB_USER || null,
// db_password = process.env.MONGODB_PASSWORD || null,
// mongoose = require('mongoose'),
// Task = require('./api/models/todoListModel'), //created model loading here
// bodyParser = require('body-parser');


// console.log('port: '+port+'\nip: '+ ip+ '\ndbService: '+dbService+'\nmongoHost: '+mongoHost+'\ndbname: ' +db_name);
// //copied from nodejs guide
// //provide a sensible default for local development
// mongodb_connection_string = 'mongodb://';//+mongoHost+':27017/' + db_name;
// if(db_user && db_password){
//   mongodb_connection_string += db_user + ':'+db_password + '@';
// }
// mongodb_connection_string += mongoHost+':27017/' + db_name;
// console.log('connection string: '+mongodb_connection_string);

// // mongoose instance connection url connection
// mongoose.Promise = global.Promise;
// //mongoose.connect('mongodb://localhost/tododb'); 
// mongoose.connect(mongodb_connection_string, {
//  useMongoClient: true
// });
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connecition error:'));

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// /*app.use(function(req, res) {
//     res.status(404).send({url: req.originalUrl + ' not found'})
//   });*/


// var routes = require('./api/routes/todoListRoutes'); //importing route
// routes(app); //register the route

// app.get('/pagecount', function (req, res) {
//   // try to initialize the db on every request if it's not already
//   // initialized.
//     db.collection('counts').count(function(err, count ){
//       res.send('{ pageCount: ' + count + '}');
//     });
// });

// // error handling
// app.use(function(err, req, res, next){
//   console.error(err.stack);
//   res.status(500).send('Something bad happened!');
// });

// console.log('Server running on http://%s:%s', ip, port);

// app.listen(port, ip);


// console.log('todo list RESTful API server started on: ' + port);

// module.exports = app ;

//  OpenShift sample Node application
var express = require('express'),
app     = express(),
morgan  = require('morgan');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
  mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
  mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
  mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
  mongoPassword = process.env[mongoServiceName + '_PASSWORD']
  mongoUser = process.env[mongoServiceName + '_USER'];

if (mongoHost && mongoPort && mongoDatabase) {
mongoURLLabel = mongoURL = 'mongodb://';
if (mongoUser && mongoPassword) {
  mongoURL += mongoUser + ':' + mongoPassword + '@';
}
// Provide UI label that excludes user id and pw
mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

}
}
var db = null,
dbDetails = new Object();

var initDb = function(callback) {
if (mongoURL == null) return;

var mongodb = require('mongodb');
if (mongodb == null) return;

mongodb.connect(mongoURL, function(err, conn) {
if (err) {
  callback(err);
  return;
}

db = conn;
dbDetails.databaseName = db.databaseName;
dbDetails.url = mongoURLLabel;
dbDetails.type = 'MongoDB';

console.log('Connected to MongoDB at: %s', mongoURL);
});
};

app.get('/', function (req, res) {
// try to initialize the db on every request if it's not already
// initialized.
if (!db) {
initDb(function(err){});
}
if (db) {
var col = db.collection('counts');
// Create a document with request IP and current time of request
col.insert({ip: req.ip, date: Date.now()});
col.count(function(err, count){
  if (err) {
    console.log('Error running count. Message:\n'+err);
  }
  res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
});
} else {
res.render('index.html', { pageCountMessage : null});
}
});

app.get('/pagecount', function (req, res) {
// try to initialize the db on every request if it's not already
// initialized.
if (!db) {
initDb(function(err){});
}
if (db) {
db.collection('counts').count(function(err, count ){
  res.send('{ pageCount: ' + count + '}');
});
} else {
res.send('{ pageCount: -1 }');
}
});

// error handling
app.use(function(err, req, res, next){
console.error(err.stack);
res.status(500).send('Something bad happened!');
});

initDb(function(err){
console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;