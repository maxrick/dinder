var express = require('express'),
app = express(),
//port = process.env.PORT || 3000,

port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
dbService = process.env.DATABASE_SERVICE_NAME || 'mongodb'
mongoHost =  process.env.MONGODB_SERVICE_HOST || '127.0.0.1',
db_name = process.env.MONGODB_DATABASE || 'dinderdb',
db_user = process.env.MONGODB_USER || null,
db_password = process.env.MONGODB_PASSWORD || null,
mongoose = require('mongoose'),
Task = require('./api/models/todoListModel'), //created model loading here
bodyParser = require('body-parser');


console.log('port: '+port+'\nip: '+ ip+ '\ndbService: '+dbService+'\nmongoHost: '+mongoHost+'\ndbname: ' +db_name);
//copied from nodejs guide
//provide a sensible default for local development
mongodb_connection_string = 'mongodb://';//+mongoHost+':27017/' + db_name;
if(db_user && db_password){
  mongodb_connection_string += db_user + ':'+db_password + '@';
}
mongodb_connection_string += mongoHost+':27017/' + db_name;
console.log('connection string: '+mongodb_connection_string);

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost/tododb'); 
mongoose.connect(mongodb_connection_string, {
 useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connecition error:'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/*app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
  });*/


var routes = require('./api/routes/todoListRoutes'); //importing route
routes(app); //register the route

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

console.log('Server running on http://%s:%s', ip, port);

app.listen(port, ip);


console.log('todo list RESTful API server started on: ' + port);

module.exports = app ;