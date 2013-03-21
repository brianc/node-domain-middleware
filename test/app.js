var express = require('express');

var domainMiddleware = require(__dirname + '/../');

var app = module.exports = express();

app.use(domainMiddleware);
app.use(app.router);
//error-handling middleware
app.use(function(err, req, res, next) {
  res.json(500, { id: process.domain.id });
});

app.get("/", function(req, res, next) {
  res.json({ id: process.domain.id });
});

app.get("/async", function(req, res, next) {
  var fs = require('fs');
  var ok = require('okay');
  process.nextTick(ok(function() {
    fs.readFile(__filename, 'utf8', function(contents) {
      res.json({ id: process.domain.id });
    });
  }));
});

app.get('/closed-error', function(req, res, next) {
  var fs = require('fs');
  res.writeHead(200, {'content-type':'application/json'});
  setTimeout(function() {
    fs.readFile(__filename, function() {
      res.end(JSON.stringify({id: process.domain.id}));
      throw new Error('why are you coding like this?');
    });
  }, 10);
});

app.get('/timeout-error', function(req, res, next) {
  setTimeout(function() {
    throw new Error('BOOM');
  }, 10);
});

app.get('/file-error', function(req, res, next) {
  var fs = require('fs');
  fs.readFile('aslkdjflasdfl', function(err, contents) {
    if(err) throw err;
  });
});

if(!module.parent) {
  var http = require('http');
  var server = http.createServer(app);
  var port = process.argv[2] || 3000;
  server.listen(port, function() {
    console.log('test app listening on %d', port);
    var routes = ['/closed-error', '/timeout-error', '/file-error', '/'];
    console.log('try hitting the following in your browser:');
    routes.forEach(function(route) {
      console.log('\thttp://localhost:%d' + route, port);
    })
  })
}
