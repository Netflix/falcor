var gulp = require('gulp');
var browserify = require('browserify');
var license = require('gulp-license');
var rename = require('gulp-rename');
var surround = require('./surround');
var vinyl = require('vinyl-source-stream');

var tvuiPrefix = '//@depend ../Rx.netflix.js\n' +
    '//@depend netflix/falcor/falcor.js\n' +
    '(function(exports) {';
var tvuiPostfix = 'exports.Model = Model;\n' +
    '}(netflix.falcor));';
var licenseInfo = {
    organization: 'Netflix, Inc',
    year: '2014'
};
gulp.task('build', ['build.node']);
gulp.task('dist', ['dist.node', 'dist.browser']);

gulp.task('build.node', ['clean.dev'], function() {
    return build(['./index.js']);
});

gulp.task('dist.node', ['clean.dist'], function() {
    return build(['./index.js'], false, false, 'dist');
});
gulp.task('dist.browser', ['clean.dist'], function() {
    return build(['./browser.js'], false, './falcor.browser.js', 'dist');
});

function build(file, standAloneName, outName, dest) {
    outName = outName || 'falcor.js';

    return browserify(file, {
            standalone: standAloneName || 'falcor'
        }).
        bundle().
        pipe(vinyl(outName)).
        pipe(license('Apache', licenseInfo)).
        pipe(gulp.dest(dest || 'bin'));
}

module.exports = build;
