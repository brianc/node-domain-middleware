var assert = require('assert');

var omf = require('omf');

var app = require(__dirname + '/app');

var isValidResponse = function(statusCode) {
  return function(res) {
    res.has.statusCode(statusCode);
    res.is.json();
    it('has id in body', function() {
      var body = JSON.parse(this.response.body);
      assert(body.id);
      assert.equal(typeof body.id, 'number');
    });
  };
};

omf(app, function(app) {
  app.get('/', isValidResponse(200));
  app.get('/async', isValidResponse(200));
  app.get('/timeout-error', isValidResponse(500));
  app.get('/file-error', isValidResponse(500));
  app.get('/closed-error', isValidResponse(200));
  app.get('/', isValidResponse(200));
});
