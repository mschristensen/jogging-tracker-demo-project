/* jshint expr: true */
/* global before */
/* global describe */
/* global it */
'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const api = require('supertest')('http://localhost:3000/api');

module.exports = function() {
  it('should have invalid email, password and name', (done) => {
    api.post('/user')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        email: 'bademail',
        password: 'pw',
        name: JSON.stringify({ first: 'F', last: 'L' })
      })
      .expect(400)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload.InvalidArguments).to.be.an('array');
        expect(res.body.payload.InvalidArguments).to.include('email');
        expect(res.body.payload.InvalidArguments).to.include('password');
        expect(res.body.payload.InvalidArguments).to.include('name.first');
        expect(res.body.payload.InvalidArguments).to.include('name.last');
        done();
      });
  });

  let token;
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
        if(err) throw err;
        expect(res.body.payload).to.include.keys('token');
        token = res.body.payload.token;
        done();
      });
  });

  it('should successfully read own user object', (done) => {
    api.get('/user/me')
      .set('Authorization', token)
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload[0]).to.include.keys('name');
        expect(res.body.payload[0].name).to.include.keys('first');
        expect(res.body.payload[0].name).to.include.keys('last');
        expect(res.body.payload[0]).to.include.keys('email');
        expect(res.body.payload[0]).to.include.keys('role');
        expect(res.body.payload[0]).to.include.keys('_id');
        expect(res.body.payload[0]).to.not.include.keys('password');
        done();
      });
  });

  it('should fail to fetch users with User role', (done) => {
    api.get('/user')
      .set('Authorization', token)
      .expect(403)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.include.keys('allowedRoles');
        expect(res.body.payload.allowedRoles).to.not.include(1);
        expect(res.body.payload.allowedRoles).to.include(2);
        expect(res.body.payload.allowedRoles).to.include(3);
        done();
      });
  });

  let userManagerToken;
  it('should successfully login as UserManager and receive token', (done) => {
    token = null;
    api.post('/user/authenticate')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        email: 'usermanager@test.com',
        password: 'password'
      })
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.include.keys('token');
        userManagerToken = res.body.payload.token;
        done();
      });
  });

  it('should successfully fetch users using UserManager role', (done) => {
    api.get('/user')
      .set('Authorization', userManagerToken)
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload[0]).to.include.keys('name');
        expect(res.body.payload[0].name).to.include.keys('first');
        expect(res.body.payload[0].name).to.include.keys('last');
        expect(res.body.payload[0]).to.include.keys('email');
        expect(res.body.payload[0]).to.include.keys('role');
        expect(res.body.payload[0]).to.include.keys('_id');
        expect(res.body.payload[0]).to.not.include.keys('password');
        done();
      });
  });

  let adminToken;
  it('should successfully login as Admin and receive token', (done) => {
    api.post('/user/authenticate')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        email: 'admin@test.com',
        password: 'password'
      })
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.include.keys('token');
        adminToken = res.body.payload.token;
        done();
      });
  });

  it('should successfully fetch users using Admin role', (done) => {
    api.get('/user')
      .set('Authorization', adminToken)
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload[0]).to.include.keys('name');
        expect(res.body.payload[0].name).to.include.keys('first');
        expect(res.body.payload[0].name).to.include.keys('last');
        expect(res.body.payload[0]).to.include.keys('email');
        expect(res.body.payload[0]).to.include.keys('role');
        expect(res.body.payload[0]).to.include.keys('_id');
        expect(res.body.payload[0]).to.not.include.keys('password');
        done();
      });
  });

  it('should fail to fetch users with invalid token', (done) => {
    // randomly shuffle the token characters (after the 'JWT ' head)
    let shuffledToken = adminToken.slice(4).split('').sort(function() { return 0.5 - Math.random(); }).join('');
    api.get('/user')
      .set('Authorization', shuffledToken)
      .expect(403)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.be.empty;
        done();
      });
  });
};
