var gulp = require('gulp');
var browserify = require('browserify');
var license = require('gulp-license');
var vinyl = require('vinyl-source-stream');
var bundle_collapser = require('bundle-collapser/plugin');

var licenseInfo = {
    organization: 'Netflix, Inc',
    year: '2014'
};

gulp.task('build', ['build.node']);

gulp.task('dist', ['dist.node', 'dist.browser']);

gulp.task('build.node', ['clean.dev'], function() {
    return build(['./lib/index.js'], {}, 'falcor.js');
});

gulp.task('dist.node', ['clean.dist'], function() {
    return build(['./lib/index.js'], {}, 'falcor.js', 'dist');
});

gulp.task('dist.browser', ['clean.dist'], function() {
    return build(['./browser.js'], { standalone: 'falcor' }, './falcor.browser.js', 'dist');
});

function build(file, browserifyOptions, outName, dest) {
    outName = outName || 'falcor.js';
    return browserify(file, browserifyOptions || {}).
        plugin(bundle_collapser).
        bundle().
        pipe(vinyl(outName)).
        pipe(license('Apache', licenseInfo)).
        pipe(gulp.dest(dest || 'bin'));
}

module.exports = build;
