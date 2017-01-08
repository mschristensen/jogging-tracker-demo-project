var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpstream = require('vinyl-source-stream');
var nodemon = require('gulp-nodemon');
var rename = require("gulp-rename");
var args = require('yargs').argv;
var gulpif = require('gulp-if');
var preprocess = require('gulp-preprocess');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var mocha = require('gulp-mocha');
var wait = require('gulp-wait');

var environment = args.env || process.env.NODE_ENV;

gulp.task('html', function() {
  gulp.src('./public/index.template.html')
    .pipe(preprocess({ context: { ENV: environment, DEBUG: true }}))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./public'));
});

gulp.task('dependencies', function() {
  gulp.src(['./node_modules/angular/angular.min.js', './node_modules/angular-ui-router/release/angular-ui-router.min.js'])
    .pipe(concat('dependencies.js'))
    .pipe(gulp.dest('./public'));
});

gulp.task('lint', function() {
  gulp.src(['./public/app/**/*.js'])
    .pipe(jshint({
      node: true,
      // list of global variables and whether they are assignable
      globals: {
        'angular': false,
        'Promise': false,
        'alert': false
      }
    }))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('scripts', function() {
  gulp.src(['./public/app/**/*.js'])
    .pipe(concat('bundle.min.js'))
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

gulp.task('build', ['html', 'dependencies', 'styles', 'lint'], function(done) {
  if(environment === 'production') {
    runSequence('scripts', done);
  } else {
    done();
  }
});

gulp.task('watch', function(done) {
  return runSequence('build', function() {
    gulp.watch(['./public/app/**/*.js', './public/app/**/*.less'], ['build']);
    done();
  });
});

gulp.task('serve', ['watch'], function() {
  nodemon({
    script: 'index.js',
    delay: 2500
  });
});

gulp.task('test', function(done) {
  environment = 'development';
  return runSequence('serve', function() {
    gulp.src('test/test.js', { read: false })
      // pause while server starts up
      .pipe(wait(3000))
      // gulp-mocha needs filepaths so you can't have any plugins before it
      .pipe(mocha())
      .once('end', () => {
        done();
      });
  });
});
