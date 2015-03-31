var gulp = require('gulp');
var jshint = require('gulp-jshint');
var eslint = require('gulp-eslint');
var jsdoc = require('gulp-jsdoc');
var concat = require('gulp-concat');
var benchmark = require('gulp-bench');

// Registers build tasks
require('./build/gulp-clean');
require('./build/gulp-build');
require('./build/gulp-test');
require('./build/performance/gulp-perf');

var buildDir = 'bin';

gulp.task('hint', ['build'], function() {
    return gulp.src(buildDir + '/**/*.js').
        pipe(jshint()).
        pipe(jshint.reporter('default')).
        pipe(jshint.reporter('fail'));
});

gulp.task('eslint', ['build'], function() {
    return gulp.src(buildDir + '/**/*.js').
        pipe(eslint()).
        pipe(eslint.format()).
        pipe(eslint.failOnError());
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

gulp.task('default', ['build', 'eslint']);
gulp.task('build', ['build.node']);
gulp.task('alt', ['build.alt']);
