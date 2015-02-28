var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jsdoc = require('gulp-jsdoc');
var mocha = require('gulp-mocha');
var istanbulEnforcer = require('gulp-istanbul-enforcer');
var surround = require('./build/surround');
var istanbul = require('gulp-istanbul');
var concat = require('gulp-concat');
var benchmark = require('gulp-bench');

// Registers build tasks
require('./build/gulp-clean');
require('./build/gulp-build');
function test(cb) {
    gulp.src(['bin/Falcor.js']).
        pipe(istanbul()).
        on('finish', function() {
            gulp.src(['test/index.js']).
                pipe(mocha()).
                pipe(istanbul.writeReports(['coverage/'])).
                on('end', cb);
        });
}

gulp.task('cover', ['dev'], function(cb) {
    test(cb);
});

gulp.task('hint', ['build.node'], function() {
    return gulp.src('bin/Model.js').
        pipe(jshint());
});

gulp.task('doc', ['clean.doc', 'doc-d']);
gulp.task('doc-p', function() {
    return gulp.src('framework/docs.js').
        pipe(jsdoc.parser({
            plugins: ['plugins/markdown'],
            name: 'Falcor',
            description: 'Here is the desc.',
            licenses: ['Apache License Version 2'],
            version: '0.1.5'
        })).
        pipe(gulp.dest('./tmp/doc'));
});
gulp.task('doc-d', ['clean.doc', 'doc-p'], function() {
    return gulp.src('tmp/doc/jsdoc.json').
        pipe(jsdoc.generator('doc'));
});

gulp.task('perf-build', ['cover'], function() {
    return gulp.src('performance/index.js', {read: false}).
        pipe(benchmark()).
        pipe(gulp.dest('.'));
});
gulp.task('perf', function() {
    return gulp.src('test.js', {read: false}).
        pipe(benchmark()).
        pipe(gulp.dest('.'));
});
gulp.task('perf-virtual', function() {
    return gulp.src('performance/virtual/index.js', {read: false}).
        pipe(benchmark()).
        pipe(gulp.dest('.'));
});

gulp.task('test', function(cb) {
    test(cb);
});

gulp.task('test-only', ['build.node'], function(cb) {
    return gulp.src(['test/index.js', 'test/virtual/addVirtualPaths.spec.js']).
        pipe(mocha());
});

gulp.task('default', ['dev']);
gulp.task('build', ['build', 'doc', 'hint', 'cover', 'perf-build']);
gulp.task('dev', ['build.dev', 'hint']);
gulp.task('prod', ['clean.dist', 'prod.tvui', 'prod.node']);
gulp.task('devWatch', ['dev'], function() {
    gulp.watch('./functional-macros/**/*.js', ['build.dev']);
});
gulp.task('devWatch.2', ['dev'], function() {
    gulp.watch('./framework/**/*.js', ['build.node', 'hint']);
});

gulp.task('com', function() {
    return gulp.
        src([
            'bin2/Falcor2.js',
            'Falcor.js',
            'Cache.js',
            'comTest.js'
        ]).
        pipe(concat({path: 'cTestFinal.js'})).
        pipe(gulp.dest('.'));
});

gulp.task('src', function() {
    return gulp.
        src([
            'src/lru.js',
            'src/support.js',
            'src/getPaths.js',
            'src/Model.js'
        ]).
        pipe(concat({path: 'Falcor2.js'})).
        pipe(gulp.dest('./bin2'));
});
