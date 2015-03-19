var gulp = require('gulp');
var browserify = require('gulp-browserify');
var license = require('gulp-license');
var rename = require('gulp-rename');
var surround = require('./surround');
var tvuiPrefix = '//@depend ../Rx.netflix.js\n' +
    '//@depend netflix/falcor/Falcor.js\n' +
    '(function(exports) {';
var tvuiPostfix = 'exports.Model = Model;\n' +
    '}(netflix.falcor));';
var licenseInfo = {
    organization: 'Netflix, Inc',
    year: '2014'
};

gulp.task('build.alt', ['clean.dev'], function() {
    return gulp.
        src(['index.js']).
        pipe(browserify({
            standalone: 'falcor'
        })).
        pipe(license('Apache', licenseInfo)).
        pipe(rename('Falcor.js')).
        pipe(gulp.dest('bin'));
});
