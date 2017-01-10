/* jshint expr: true */
/* global before */
/* global describe */
/* global it */
'use strict';

const should = require('chai').should();
const expect = require('chai').expect;
const api = require('supertest')('http://localhost:3000/api');

module.exports = function() {
  // TODO: as User fail to create jog for another user

  // DONE (login as User One)
  // DONE fail to create valid jog
  // DONE fail to create jog without valid token
  // DONE create jog
  // DONE read jogs
  // DONE fail to read jogs without valid token
  // DONE (login as User Two)
  // DONE fetch User One _id
  // DONE fail to read User One's jog
  // (login as Admin)
  // create own jog
  // read own jogs
  // create jog for User
  // read User's jogs

  let userOneToken;
  it('should successfully create User One and return token', (done) => {
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
        userOneToken = res.body.payload.token;
        done();
      });
  });

  it('should fail to create a valid jog', (done) => {
    api.post('/jog')
      .set('Authorization', userOneToken)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        date: Date.now(),
        distance: -1,
        time: -1
      })
      .expect(400)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload.InvalidArguments).to.be.an('array');
        expect(res.body.payload.InvalidArguments).to.include('distance');
        expect(res.body.payload.InvalidArguments).to.include('time');
        done();
      });
  });

  it('should fail to create jog with invalid token', (done) => {
    // randomly shuffle the token characters (after the 'JWT ' head)
    let shuffledToken = userOneToken.slice(4).split('').sort(function() { return 0.5 - Math.random(); }).join('');
    api.post('/jog')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', shuffledToken)
      .send({
        date: Date.now(),
        distance: 1,
        time: 1
      })
      .expect(403)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.be.empty;
        done();
      });
  });

  it('should successfully create jog as User', (done) => {
    api.post('/jog')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', userOneToken)
      .send({
        date: Date.now(),
        distance: 1,
        time: 1
      })
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        done();
      });
  });

  it('should fail to read own jogs as User with invalid token', (done) => {
    // randomly shuffle the token characters (after the 'JWT ' head)
    let shuffledToken = userOneToken.slice(4).split('').sort(function() { return 0.5 - Math.random(); }).join('');
    api.get('/jog')
      .set('Authorization', shuffledToken)
      .expect(403)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.be.empty;
        done();
      });
  });

  it('should successfully read own jogs as User', (done) => {
    api.get('/jog')
      .set('Authorization', userOneToken)
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload[0]).to.include.keys('date');
        expect(res.body.payload[0]).to.include.keys('distance');
        expect(res.body.payload[0]).to.include.keys('time');
        done();
      });
  });

  let userOneId;
  it('should successfully read own user object', (done) => {
    api.get('/user/me')
      .set('Authorization', userOneToken)
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
        userOneId = res.body.payload[0]._id;
        done();
      });
  });

  it('should successfully read own jogs using id query argument', (done) => {
    api.get('/jog')
      .query({ user_id: userOneId })
      .set('Authorization', userOneToken)
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload[0]).to.include.keys('date');
        expect(res.body.payload[0]).to.include.keys('distance');
        expect(res.body.payload[0]).to.include.keys('time');
        done();
      });
  });

  let userTwoToken;
  it('should successfully create User Two and return token', (done) => {
    api.post('/user')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        email: 'user@two.com',
        password: 'password',
        name: JSON.stringify({ first: 'User', last: 'Two' })
      })
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.include.keys('token');
        userTwoToken = res.body.payload.token;
        done();
      });
  });

  it('should fail to read User One jogs using User Two token', (done) => {
    api.get('/jog')
      .query({ user_id: userOneId })
      .set('Authorization', userTwoToken)
      .expect(403)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.be.empty;
        done();
      });
  });

  it('should fail to create jog for User One as User Two', (done) => {
    api.post('/jog')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', userTwoToken)
      .send({
        user_id: userOneId,
        date: Date.now(),
        distance: 1,
        time: 1
      })
      .expect(403)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload).to.be.empty;
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

  it('should successfully create jog as Admin', (done) => {
    api.post('/jog')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', adminToken)
      .send({
        date: Date.now(),
        distance: 1,
        time: 1
      })
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        done();
      });
  });

  it('should successfully create jog for User as Admin', (done) => {
    api.post('/jog')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', adminToken)
      .send({
        user_id: userOneId,
        date: Date.now(),
        distance: 2,
        time: 2
      })
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        done();
      });
  });

  it('should successfully read own jogs as Admin', (done) => {
    api.get('/jog')
      .set('Authorization', adminToken)
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload[0]).to.include.keys('date');
        expect(res.body.payload[0]).to.include.keys('distance');
        expect(res.body.payload[0]).to.include.keys('time');
        done();
      });
  });

  it('should successfully read User jogs as Admin', (done) => {
    api.get('/jog')
      .query({ user_id: userOneId })
      .set('Authorization', adminToken)
      .expect(200)
      .end((err, res) => {
        if(err) throw err;
        expect(res.body.payload[0]).to.include.keys('date');
        expect(res.body.payload[0]).to.include.keys('distance');
        expect(res.body.payload[0]).to.include.keys('time');
        done();
      });
  });
};
