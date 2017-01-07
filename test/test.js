var async = require('../utils/generators.js').async;

var test = async(function* () {
  var server = yield require('../index.js');
});

test();
