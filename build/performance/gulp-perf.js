var gulp = require('gulp');
var build = require('./../gulp-build');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var Transform = require("stream").Transform;
var Rx = require('rx');
var Observable = Rx.Observable;
var fs = require('fs');
var path = require('path');

gulp.task('perf', ['perf-device']);
gulp.task('perf-update', runner);
gulp.task('perf-assemble', ['clean.perf'], assemble);
gulp.task('perf-device', ['perf-assemble'], runner);
gulp.task('perf-browser', ['perf-assemble-browser'], runner);
gulp.task('perf-assemble-browser', ['clean.perf'], browser);
gulp.task('perf-all', ['perf-device', 'perf-browser']);

function assemble() {
    return gulp.
        src(['./performance/testConfig.js']).
        pipe(browserify({
            standalone: 'testConfig'
        })).
        pipe(rename('assembledPerf.js')).
        pipe(gulp.dest('performance/bin'));
}

function browser() {
    return gulp.
        src(['./performance/browser.js']).
        pipe(browserify({
            standalone: 'browser'
        })).
        pipe(rename('browser.js')).
        pipe(gulp.dest('performance/bin'));
}

function runner() {
    return gulp.
        src(['performance/bin/assembledPerf.js', 'performance/device.js']).
        pipe(concat({path: 'device.js'})).
        pipe(gulp.dest('performance/bin'));
}
