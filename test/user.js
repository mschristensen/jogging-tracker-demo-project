const should = require('chai').should();
const expect = require('chai').expect;
const supertest = require('supertest');
const api = supertest('http://localhost:3000');

module.exports = function() {
  describe('UserTest', () => {
    it('should ...', (done) => {
      done();
    });
  });
};
