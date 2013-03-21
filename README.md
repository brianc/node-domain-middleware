# domain-middleware

Hi! Are you sick of using `process.uncaughtException` in your express apps to keep them running?

OR...Do you just let your process crash on any unhandled exception and restart it?

Do you writhe in agony when you pass "request.id" to 8 nested database calls so you can keep a context of what request you're working on?

How do you associate log entries with a specific request?  Passing the request around everywhere again?

Stop hitting yourself...there __is__ a better way.

## USE DOMAINS

First, [read this](http://nodejs.org/api/domain.html)

Second, realize once you enable domains `process.domain` will give you the active domain in any level of nested callback.

Third, use this one liner to have an absolutely no-brainer win-win super cool high five never crashing express app:

```js
express.use(require('domain-middleware'));
```

Fourth, realize sometimes modules with C++ bindings will leave the domain so you aren't actually at never crashing quite yet.

Fifth, cope with that _easily_ by [using this](https://github.com/brianc/node-okay) or you can use `process.domain.intercept` to rebind those weird C++ callbacks

Sixth, realize I'm very sleepy and I will rewrite this README soon.  And I will write a blog post about using domains in general.


### domain-middleware api

#### var domainMiddlewaire = require('domain-middleware');

#### domainMiddleware = function(req, res, next) 

Exports a function matching the signature of express middleware.  Binds incomming request & response from express to a new domain.  Assigns the domain a unique id by calling `domainMiddleware.id(req)`.

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
        throw new Error("congratulations, your node process crashed");
      });
    });
  })
});
```
now with less crashing...

```js
//with domain-middleware
app.use(require('domain-middleware'));
app.use(app.router);
app.use(function errorHandler(err, req, res, next) {
  console.log('error on request %d %s %s: %j', process.domain.id, req.method, req.url, err);
  res.send(500, "Something bad happened. :(");
});
app.get('/error', function(req, res, next) {
  db.query('SELECT happiness()', process.domain.intercept(function(rows) {
    fs.readFile('asldkfjasdf', process.domain.intercept(function(contents) {
      process.nextTick(process.domain.inercept(function() {
        throw new Error("The individual request will be passed to the express error handler, and your application will keep running.");
      }));
    }));
  }));
});
```

## license
MIT
