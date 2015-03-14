var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var build = require('./build');

gulp.task('build.perf', function() {
    return gulp.
        src([
            'tmp/perf/*.js',
            'performance/testConfig.js',
            'performance/comTest.js'
        ]).
        pipe(concat({path: 'perf-tests.js'})).
        pipe(gulp.dest('performance/bin'));
});

gulp.task('build.perf-data', ['build.perf-data'], function() {
    return gulp.
        src([
            'test/data/Cache.js'
        ]).
        pipe(browserify({
            standalone: 'Cache'
        })).
        pipe(gulp.dest('tmp/perf/Cache'));
});

