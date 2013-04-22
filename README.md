# express-domain-middleware

[![Build Status](https://travis-ci.org/brianc/node-domain-middleware.png?branch=master)](https://travis-ci.org/brianc/node-domain-middleware)

Hi! Are you using `process.uncaughtException` in your express apps to keep them running?

OR...Do you just let your process crash on any unhandled exception and restart it?

Do you find it hard to pass "request.id" to 8 nested database calls so you can keep a context of what request you're working on?

How do you associate log entries with a specific request?  Passing the request around everywhere again?

Domains can help.

## USE DOMAINS

First, [read this](http://nodejs.org/api/domain.html)

Second, realize once you enable domains `process.domain` will give you the active domain.

Third, use this middleware to bind each request/response pair to its own domain.

```js
express.use(require('express-domain-middleware'));
```

### express-domain-middleware api

#### var domainMiddleware = require('express-domain-middleware');

#### domainMiddleware = function(req, res, next) 

Exports a function matching the signature of express middleware.  Binds incoming request & response from express to a new domain.  Assigns the domain a unique id by calling `domainMiddleware.id(req)`.

If the domain emits an error event, `domainMiddleware` will call `next(err)` with the error event from the domain.  This allows existing express specific error handling middleware to
function as if the error was hanlded by your application code.  Allow me to demonstrate with an example:

```js
///old-school
app.get('/error', function(req, res, next) {
  db.query('SELECT happiness()', function(err, rows) {
    if(err) return next(err);    
    fs.readFile('alskdjflasd', function(err, contents) {
      if(err) return next(err);
      process.nextTick(function() {
        throw new Error("congratulations, your node process crashed and the user request disconnected in a jarring way");
      });
    });
  })
});
```


now with less crashing...


```js
//with domain-middleware
app.use(require('express-domain-middleware'));
app.use(app.router);
app.use(function errorHandler(err, req, res, next) {
  console.log('error on request %d %s %s: %j', process.domain.id, req.method, req.url, err);
  res.send(500, "Something bad happened. :(");
  if(err.domain) {
    //you should think about gracefully stopping & respawning your server
    //since an unhandled error might put your application into an unknown state
  }
});
app.get('/error', function(req, res, next) {
  db.query('SELECT happiness()', process.domain.intercept(function(rows) {
    fs.readFile('asldkfjasdf', process.domain.intercept(function(contents) {
      process.nextTick(process.domain.intercept(function() {
        throw new Error("The individual request will be passed to the express error handler, and your application will keep running.");
      }));
    }));
  }));
});
```


I have to recommend using [okay](https://github.com/brianc/node-okay) to gracefully fallback in the absence of domains.  Plus..it's terse. Go, code golf!

```js
var ok = require('okay');
app.use(require('express-domain-middleware'));
app.use(app.router);
app.use(function errorHandler(err, req, res, next) {
  console.log('error on request %d %s %s: %j', process.domain.id, req.method, req.url, err);
  res.send(500, "Something bad happened. :(");
});
app.get('/error', function(req, res, next) {
  db.query('SELECT happiness()', ok(next, function(rows) {
    fs.readFile('asldkfjasdf', ok(next, function(contents) {
      process.nextTick(ok(next, function() {
        throw new Error("The individual request will be passed to the express error handler, and your application will keep running.");
      }));
    }));
  }));
});
```

## license
MIT
