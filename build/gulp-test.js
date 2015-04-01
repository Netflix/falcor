var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('test-coverage', function (cb) {
  gulp.src(['./lib/**/*.js'])
    .pipe(istanbul())
    // .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['./test/index.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

gulp.task('test', function (cb) {
  gulp.src(['./test/index.js'])
    .pipe(mocha())
    .on('end', cb);
});
