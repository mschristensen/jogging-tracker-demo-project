'use strict';

describe('Unit: App', function () {
  beforeEach(module('app'));
  beforeEach(module('ui.router'));

  describe('App Abstract Route', function () {
      var $state,
          $rootScope,
          state = 'auth';

      beforeEach(inject(function (_$state_, $templateCache, _$rootScope_) {
          $state = _$state_;
          $rootScope = _$rootScope_;
          $templateCache.put('app/home/home.tmpl.html', '');
      }));

      it('verifies state configuration', function () {
          var config = $state.get(state);
          expect(config.abstract).to.equal(true);
          expect(config.url).to.equal(undefined);
      });
  });
});
