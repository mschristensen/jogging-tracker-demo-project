let generators = {};

// Keep manually moving a generator function forwards with
// the results of any promises it has yielded
generators.async = function(makeGenerator) {
  return function () {
    let generator = makeGenerator.apply(this, arguments);

    function handle(result) {
      // result => { done: [Boolean], value: [Object] }
      if (result.done) return Promise.resolve(result.value);

      return Promise.resolve(result.value).then((res) => {
        return handle(generator.next(res));
      }, (err) => {
        return handle(generator.throw(err));
      });
    }

    try {
      return handle(generator.next());
    } catch (ex) {
      return Promise.reject(ex);
    }
  };
};

module.exports = generators;
