var gulp = require('gulp');
var concat = require('gulp-concat');
var vinyl = require('vinyl-source-stream');
var browserify = require('browserify');
var gulpShell = require('gulp-shell');

gulp.task('perf', ['perf-device']);
gulp.task('perf-update', runner);
gulp.task('perf-assemble', ['clean.perf'], assemble);
gulp.task('perf-device', ['perf-assemble'], runner);
gulp.task('perf-browser', ['perf-assemble-browser'], runner);
gulp.task('perf-assemble-browser', ['clean.perf'], browser);
gulp.task('perf-all', ['perf-device', 'perf-browser']);
gulp.task('perf-run', ['perf-device', 'perf-browser'], run());

function run() {
    return gulpShell.task([
        'karma start ./performance/karma.conf.js',
        'node ./performance/node.js'
    ], {
        ignoreErrors:true
    });
}

function assemble() {
    return browserify('./performance/testConfig.js', {
            standalone: 'testConfig'
        }).
        bundle().
        pipe(vinyl('assembledPerf.js')).
        pipe(gulp.dest('performance/bin'));
}

function browser() {
    return browserify('./performance/browser.js', {
            standalone: 'browser'
        }).
        bundle().
        pipe(vinyl('browser.js')).
        pipe(gulp.dest('performance/bin'));
}

function runner() {
    return gulp.
        src(['performance/bin/assembledPerf.js', 'performance/device.js']).
        pipe(concat({path: 'device.js'})).
        pipe(gulp.dest('performance/bin'));
}
