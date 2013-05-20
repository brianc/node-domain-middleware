var createDomain = require('domain').create

var domainMiddleware = module.exports = function(req, res, next) {
  var domain = createDomain();
  domain.id = domainMiddleware.id(req);
  domain.add(req);
  domain.add(res);
  domain.run(function() {
    next();
  });
  domain.on('error', function(e) {
    next(e);
  });
};

var count = 0;
//you can replace this method to
//supply your own id builder
domainMiddleware.id = function(req) {
  return new Date().getTime() + (count++);
};
