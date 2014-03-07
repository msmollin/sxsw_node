
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//*** Access Token Check ***//
function accessTokenRequired(req, res, next) {
  if (req.headers['access_token'] === "fedb1055ca2b630bf0fa6398ebfe174147a855d0"){ //SHA1("SXSW")
		next();
		return;
	}
	res.send(401);
	next();
}

//*** Root Route ***//
var rootCallback = function(req,res){
	res.send('SXSW Node server');
};
app.get('/', rootCallback);

//*** Login Route ***//
var loginCallback = function(req,res){
	if (req.body['email'] !== 'test@test.com'){ console.log('wrong email'); res.send(401);  return;}
	if (req.body['password'] !== 'test'){ console.log('wrong password'); res.send(401);  return;}
	fs.readFile('json/login.json', function (err, data) {
	  if (err) throw err;
		var loginObj = JSON.parse(data);
		fs.readFile('json/cats.json', function (err, data) {
		  if (err) throw err;
			var catsObj = shortCatsJsonObj(data);
			loginObj['cats'] = catsObj;
			res.json(loginObj);
		});
	});
	// res.send(200);
};
app.post('/login',loginCallback);

//*** Cats Route ***//

var shortCatsJsonObj = function(data){
	var catsObj = JSON.parse(data);
	for (index = 0; index < catsObj.length; ++index){
		delete catsObj[index]['long_description'];
		delete catsObj[index]['large_photo_url'];
	}
	return catsObj;
};

var catsCallback = function(req,res){
	fs.readFile('json/cats.json', function (err, data) {
	  if (err) throw err;
		res.json(shortCatsJsonObj(data));
	});
};

app.get('/cats', accessTokenRequired, catsCallback);

//*** Single Cat Route ***//
var singleCatCallback = function(req,res){
	var cat_id = req.params.id;
	fs.readFile('json/cats.json', function (err, data) {
		if (err) throw err;
	  var catsObj = JSON.parse(data);
	  res.json(catsObj[cat_id]);
	});
};
app.get('/cats/:id', accessTokenRequired, singleCatCallback);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
