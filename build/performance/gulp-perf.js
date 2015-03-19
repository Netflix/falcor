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

gulp.task('perf', ['perf-runner']);
gulp.task('perf-runner', ['perf-assemble'], runner);

gulp.task('perf-update', runner);
gulp.task('perf-assemble', ['clean.perf'], assemble);

gulp.task('perf-ios', ['perf-assemble-ios'], runner);
gulp.task('perf-assemble-ios', ['clean.perf'], ios);

function assemble() {
    return gulp.
        src(['./performance/testConfig.js']).
        pipe(browserify({
            standalone: 'testConfig'
        })).
        pipe(rename('assembledPerf.js')).
        pipe(gulp.dest('performance/bin'));
}

function ios() {
    return gulp.
        src(['./performance/iOS-test-header.js']).
        pipe(browserify({
            standalone: 'ios'
        })).
        pipe(rename('assembledPerf.js')).
        pipe(gulp.dest('performance/bin'));
}

function runner() {
    return gulp.
        src(['performance/bin/assembledPerf.js', 'performance/device-test-header.js']).
        pipe(concat({path: 'deviceRunner.js'})).
        pipe(gulp.dest('performance/bin'));
}
