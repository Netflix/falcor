var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var surround = require('./../surround');
var build = require('./../build');
var support = require('./../gulp-build-support');

gulp.task('build.perf', ['perf-assemble']);
gulp.task('build.perf-update', runner);
gulp.task('build.perf-assemble', assemble);
gulp.task('build.perf-full', ['perf-compile']);

gulp.task('perf-compile', ['perf-standalone-compile'], function() {
    return runner();
});
gulp.task('perf-assemble', ['perf-standalone-assemble'], function() {
    return runner();
});

gulp.task('perf-standalone-compile', ['perf-sweet-compile', 'perf-recurse-compile'], function() {
    return assemble();
});
gulp.task('perf-standalone-assemble', ['perf-sweet-assemble', 'perf-recurse-assemble'], function() {
    return assemble();
});

gulp.task('perf-sweet-compile', ['build.combine'], function() {
    return compile(build.compile, 'falcor.s.js');
});
gulp.task('perf-sweet-assemble', ['build.support-only-replace', 'perf-ops'], function() {
    return compile(build.compile, 'falcor.s.js');
});

gulp.task('perf-recurse-compile', ['build.combine', 'build.get.ops'], function() {
    return compile(build.compileWithGetOps, 'falcor.r.js');
});
gulp.task('perf-recurse-assemble', ['build.get.ops', 'build.support-only-replace', 'perf-recurse-ops'], function() {
    return compile(build.compileWithGetOps, 'falcor.r.js');
});

gulp.task('perf-recurse-ops', ['build.support-only-replace', 'clean.perf'], function() {
    return support.buildRecursiveOperations();
});
gulp.task('perf-ops', ['build.support-only-replace', 'clean.perf'], function() {
    return support.buildOperations();
});

function compile(src, name) {
    return gulp.src(src).
        pipe(concat({path: name})).
        pipe(surround({
            prefix: '',
            postfix: 'module.exports = falcor;'
        })).
        pipe(gulp.dest('performance/bin'));
}

function assemble() {
    return gulp.
        src(['./performance/testConfig.js']).
        pipe(browserify({
            standalone: 'testConfig'
        })).
        pipe(rename('assembledPerf.js')).
        pipe(gulp.dest('performance/bin'));
}

function runner() {
    return gulp.
        src(['performance/next_falcor.js', 'performance/bin/assembledPerf.js', 'performance/device-test-header.js']).
        pipe(concat({path: 'deviceRunner.js'})).
        pipe(gulp.dest('performance/bin'));
}
