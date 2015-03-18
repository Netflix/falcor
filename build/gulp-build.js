var gulp = require('gulp');
var browserify = require('gulp-browserify');
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

gulp.task('build.alt', function() {
    return gulp.
        src(['index.js']).
        pipe(browserify({
            standalone: 'falcor'
        })).
        pipe(license('Apache', licenseInfo));
});
