var gulp = require('gulp');
var browserify = require('browserify');
var license = require('gulp-license');
var uglify = require('gulp-uglify');
var vinyl = require('vinyl-source-stream');
var bundle_collapser = require('bundle-collapser/plugin');
var _ = require('lodash');
var path = require('path');

var licenseInfo = {
    organization: 'Netflix, Inc',
    year: '2015'
};

gulp.task('build', ['build.browser', 'build.all']);
gulp.task('dist', ['dist.browser', 'dist.all']);
gulp.task('all', ['build.browser', 'dist.browser', 'build.all', 'dist.all', 'lint']);
gulp.task('build-with-lint', ['build.browser', 'dist.browser', 'lint']);

gulp.task('dist.browser', ['clean.dist'], function(cb) {
    build({
        file: ['./browser.js'],
        outName: "falcor.browser",
        browserifyOptions: { standalone: 'falcor' },
        debug: false
    }, cb);
});

gulp.task('build.browser', ['clean.dist'], function(cb) {
    return build({
        file: ['./browser.js'],
        outName: "falcor.browser",
        browserifyOptions: { standalone: 'falcor' }
    }, cb);
});

gulp.task('dist.all', ['clean.dist'], function(cb) {
    build({
        file: ['./all.js'],
        outName: "falcor.all",
        browserifyOptions: { standalone: 'falcor' },
        debug: false
    }, cb);
});

gulp.task('build.all', ['clean.dist'], function(cb) {
    return build({
        file: ['./all.js'],
        outName: "falcor.all",
        browserifyOptions: { standalone: 'falcor' }
    }, cb);
});

function build(options, cb) {
    options = _.assign({
        file: '',
        browserifyOptions: {},
        outName: options.outName,
        dest: 'dist',
        debug: true
    }, options);

    var name = options.outName + (!options.debug && '.min' || '') + '.js';
    browserify(options.file, options.browserifyOptions).
        plugin(bundle_collapser).
        bundle().
        pipe(vinyl(name)).
        pipe(license('Apache', licenseInfo)).
        pipe(gulp.dest(options.dest)).
        on('finish', function() {
            if (options.debug) {
                return cb();
            }

            var destAndName = path.join(options.dest, name);
            gulp.
                src(destAndName).
                pipe(uglify()).
                pipe(gulp.dest(options.dest)).
                on('finish', function() {
                    return cb();
                });
        });
}

module.exports = build;
