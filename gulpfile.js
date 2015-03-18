var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jsdoc = require('gulp-jsdoc');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var concat = require('gulp-concat');
var benchmark = require('gulp-bench');

// Registers build tasks
require('./build/gulp-clean');
require('./build/gulp-build');

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

gulp.task('default', ['build']);
gulp.task('alt', ['build.alt']);
