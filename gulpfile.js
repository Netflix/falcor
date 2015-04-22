var gulp = require('gulp');
var jshint = require('gulp-jshint');
var eslint = require('gulp-eslint');
var jsdoc = require('gulp-jsdoc');
var runSequence = require('run-sequence');
var concat = require('gulp-concat');
var benchmark = require('gulp-bench');

// Registers build tasks
require('./build/gulp-clean');
require('./build/gulp-build');
require('./build/gulp-test');
require('./build/performance/gulp-perf');

var srcDir = 'lib';

gulp.task('hint', ['build'], function() {
    return gulp.src(srcDir + '/**/*.js').
        pipe(jshint()).
        pipe(jshint.reporter('default')).
        pipe(jshint.reporter('fail'));
});

gulp.task('lint', function() {
    return gulp.src(srcDir + '/**/*.js').
        pipe(eslint()).
        pipe(eslint.format()).
        pipe(eslint.failAfterError());
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

// Run in serial to fail build if lint fails.
gulp.task('default', function(callback) {
    return runSequence('lint', 'build', callback);
});

gulp.task('build', ['build.node']);
