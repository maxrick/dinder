var express = require('express'),
app = express(),
//port = process.env.PORT || 3000,

port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
dbService = process.env.DATABASE_SERVICE_NAME || 'mongodb'
mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL || '127.0.0.1',
mongoURLLabel = "",
db_name = process.env.MONGODB_DATABASE || 'dinderdb',
mongoose = require('mongoose'),
Task = require('./api/models/todoListModel'), //created model loading here
bodyParser = require('body-parser');


console.log('port: '+port+'\nip: '+ ip+ '\ndbService'+dbService+'\nmongoUrl: '+mongoURL+'\ndbname: ' +db_name);
//copied from nodejs guide
//provide a sensible default for local development
mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + db_name;
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
}

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost/tododb'); 
mongoose.connect(mongodb_connection_string);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/*app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
  });*/


var routes = require('./api/routes/todoListRoutes'); //importing route
routes(app); //register the route


app.listen(port, ip);


console.log('todo list RESTful API server started on: ' + port);