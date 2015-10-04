var createDomain = require('domain').create

var domainMiddleware = module.exports = function(req, res, next) {
  var domain = createDomain();
  domain.id = domainMiddleware.id(req);
  domain.add(req);
  domain.add(res);
  domain.run(next);
  domain.on('error', next);
};

var count = 0;
//you can replace this method to
//supply your own id builder
domainMiddleware.id = function(req) {
  return new Date().getTime() + (count++);
};
