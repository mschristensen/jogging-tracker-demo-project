'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpstream = require('vinyl-source-stream');
const rename = require("gulp-rename");
const args = require('yargs').argv;
const gulpif = require('gulp-if');
const preprocess = require('gulp-preprocess');
const runSequence = require('run-sequence');
const jshint = require('gulp-jshint');
const concat = require('gulp-concat');
const less = require('gulp-less');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const mocha = require('gulp-mocha');
const wait = require('gulp-wait');
const gulpNgConfig = require('gulp-ng-config');
const babel = require('gulp-babel');
const exec = require('child_process').exec;

let environment = args.env || process.env.NODE_ENV;

gulp.task('html', function() {
  gulp.src('./public/index.template.html')
    .pipe(preprocess({ context: { ENV: environment, DEBUG: true }}))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./public'));
});

gulp.task('dependencies', function() {
  gulp.src(['./node_modules/angular/angular.min.js',
            './node_modules/angular-ui-router/release/angular-ui-router.min.js',
            './node_modules/angular-cache/dist/angular-cache.min.js',
            './node_modules/angular-mocks/angular-mocks.js'])
    .pipe(concat('dependencies.js'))
    .pipe(gulp.dest('./public'));
});

gulp.task('lint', function() {
  gulp.src(['./public/app/**/*.js', '!./public/app/**/*.spec.js', '*.js', './utils/**/*.js', './test/**/*.js', './config/**/*.js', './app/**/*.js'])
    .pipe(jshint({
      node: true,
      // list of global variables and whether they are assignable
      globals: {
        'angular': false,
        'Promise': false,
        'alert': false
      },
      esversion: 6
    }))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('scripts', function() {
  gulp.src(['./public/app/**/*.js'])
    .pipe(concat('bundle.min.js'))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public'));
});

gulp.task('styles', function() {
  gulp.src(['./public/app/core.less', './public/app/**/*.less'])
    .pipe(concat('app.css'))
    .pipe(less().on('error', function (err) {
      throw new gutil.PluginError({
        plugin: 'styles:less',
        message: err.toString()
      });
    }))
    .pipe(uglifycss().on('error', function (err) {
      throw new gutil.PluginError({
        plugin: 'styles:uglifycss',
        message: err.toString()
      });
    }))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('./public'));
});

gulp.task('angular-config', function () {
  gulp.src('./angular.config.json')
    .pipe(gulpNgConfig('app', {
      environment: environment || 'development',
      createModule: false
    }))
    .pipe(gulp.dest('./public/app/config'));
});

gulp.task('build', ['html', 'angular-config', 'dependencies', 'styles', 'lint'], function(done) {
  if(environment === 'production') {
    runSequence('scripts', done);
  } else {
    done();
  }
});

gulp.task('start', function(done) {
  exec('npm start', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    done(err);
  });
});

gulp.task('run-tests', function(done) {
  gulp.src('test/test.js', { read: false })
    // pause while server starts up
    .pipe(wait(3000))
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha())
    .once('end', () => {
      done();
    });
});

gulp.task('test', function(done) {
  environment = 'development';
  return runSequence('build', ['start', 'run-tests']);
});
