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
gulp.task('perf-construct', ['clean.perf'], constructPerfFalcors);
gulp.task('perf-assemble', ['perf-construct'], assemble);
gulp.task('perf-device', ['perf-assemble'], runner);

gulp.task('perf-b', ['perf-assemble-browser-no-construct'], runner);
gulp.task('perf-browser', ['perf-assemble-browser'], runner);
gulp.task('perf-assemble-browser', ['perf-construct'], browser);
gulp.task('perf-assemble-browser-no-construct', browser);

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
        pipe(concat({path: 'deviceRunner.js'})).
        pipe(gulp.dest('performance/bin'));
}

function constructPerfFalcors() {
    var root = path.join(__dirname, '../..');
    var packageJSON = path.join(root, 'package.json');
    var readFile = Observable.fromNodeCallback(fs.readFile);
    var obs = readFile(packageJSON).
        map(JSON.parse).
        map(pluckPerf).
        flatMap(function(perf) {
            var dest = perf.dest;
            var files = Object.
                keys(perf.files).
                map(function(name) {
                    return [dest, name, perf.files[name]];
                });
            return Observable.
                fromArray(files).
                flatMap(runBuild);
        }).
        takeLast();

    var stream = new Transform();
    obs.subscribe(
        stream.emit.bind(stream, "data"),
        function(err) {
            console.log("err: ", err)
        },
        stream.emit.bind(stream, "end"));
    return stream;
}

function pluckPerf(x) {
    return x.perf;
}

function runBuild(destNameAndConfigTuple) {
    var root = path.join(__dirname, '../..');
    var dest = path.join(root, destNameAndConfigTuple[0]);
    var name = destNameAndConfigTuple[1];
    var config = destNameAndConfigTuple[2];
    var file = [path.join(root, name)];

    return Rx.Node.fromStream(build(file, config.standalone, config.out, dest));
}
