var gulp = require('gulp');
var concat = require('gulp-concat');
var vinyl = require('vinyl-source-stream');
var browserify = require('browserify');
var gulpShell = require('gulp-shell');

gulp.task('perf-assemble', [], assemble);
gulp.task('perf-device', ['perf-assemble'], device);
gulp.task('perf-browser', ['perf-assemble'], browser);
gulp.task('perf-all', ['clean.perf', 'perf-device', 'perf-browser']);
gulp.task('perf-run', ['perf-all'], run());

function run() {
    return gulpShell.task([
        'karma start ./performance/karma.conf.js',
        'node --expose-gc ./performance/node.js'
    ]);
}

function assemble() {
    return browserify('./performance/device.js', {
            ignoreMissing: true
        }).
        bundle().
        pipe(vinyl('device-body.js')).
        pipe(gulp.dest('performance/bin'));
}

function browser() {
    return browserify('./performance/browser.js').
        bundle().
        pipe(vinyl('browser.js')).
        pipe(gulp.dest('performance/bin'));
}

function device() {
    return gulp.
        src(['./node_modules/nf-falcor-device-perf/devicePolyfill.js', 'performance/bin/device-body.js']).
        pipe(concat({path: 'device.js'})).
        pipe(gulp.dest('performance/bin'));
}
