/* jshint expr: true */
/* global before */
/* global describe */
/* global it */
'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const api = require('supertest')('http://localhost:3000/api');

module.exports = function() {
  describe('Users', () => {
    let token;
    it('should have invalid email, password and name', (done) => {
      api.post('/user')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          email: 'bademail',
          password: 'pw',
          name: JSON.stringify({ first: 'F', last: 'L' })
        })
        .expect(403)
        .end((err, res) => {
          expect(res.body.payload.InvalidArguments).to.be.an('array');
          expect(res.body.payload.InvalidArguments).to.include('email');
          expect(res.body.payload.InvalidArguments).to.include('password');
          expect(res.body.payload.InvalidArguments).to.include('name.first');
          expect(res.body.payload.InvalidArguments).to.include('name.last');
          done();
        });
    });

    it('should successfully create new user and return token', (done) => {
      api.post('/user')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          email: 'user@one.com',
          password: 'password',
          name: JSON.stringify({ first: 'User', last: 'One' })
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.payload).to.include.keys('token');
          token = res.body.payload.token;
          done();
        });
    });

    it('should successfully fetch users using token', (done) => {
      api.get('/user')
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.payload[0]).to.include.keys('name');
          expect(res.body.payload[0].name).to.include.keys('first');
          expect(res.body.payload[0].name).to.include.keys('last');
          expect(res.body.payload[0]).to.include.keys('email');
          expect(res.body.payload[0]).to.include.keys('role');
          expect(res.body.payload[0]).to.not.include.keys('password');
          done();
        });
    });

    it('should successfully login and receive new token', (done) => {
      token = null;
      api.post('/user/authenticate')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          email: 'user@one.com',
          password: 'password'
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.payload).to.include.keys('token');
          token = res.body.payload.token;
          done();
        });
    });

    it('should successfully fetch users using token', (done) => {
      api.get('/user')
        .set('Authorization', token)
        .expect(200)
        .end((err, res) => {
          expect(res.body.payload[0]).to.include.keys('name');
          expect(res.body.payload[0].name).to.include.keys('first');
          expect(res.body.payload[0].name).to.include.keys('last');
          expect(res.body.payload[0]).to.include.keys('email');
          expect(res.body.payload[0]).to.include.keys('role');
          expect(res.body.payload[0]).to.not.include.keys('password');
          done();
        });
    });

    it('should fail to fetch users with invalid token', (done) => {
      // randomly shuffle the token characters (after the 'JWT ' head)
      let shuffledToken = token.slice(4).split('').sort(function() { return 0.5 - Math.random(); }).join('');
      api.get('/user')
        .set('Authorization', shuffledToken)
        .expect(403)
        .end((err, res) => {
          expect(res.body.payload).to.be.empty;
          done();
        });
    });
  });
};
