var gulp = require('gulp');
var distributeSweetCompile = require('./distribute-sweet-compile');
var browserify = require('gulp-browserify');
var surround = require('./surround');
var concat = require('gulp-concat');
var build = require('./build');
var support = require('./gulp-build-support');
var tvuiPrefix = '//@depend ../Rx.netflix.js\n' +
    '//@depend netflix/falcor/Falcor.js\n' +
    '(function(exports) {';
var tvuiPostfix = 'exports.Model = Model;\n' +
    '}(netflix.falcor));';

// build.macros -> |
// build.framework ->

gulp.task('build', ['clean.dev', 'build.node', 'build.tvui', 'build.akira', 'build.browser', 'build.raw']);
gulp.task('build.dev', ['clean.dev', 'build.node']);

gulp.task('build.macros', ['clean.dev'], function() {
    return gulp.src([
            "./macros/*.sjs.js",
            "./macros/values/*.sjs.js",
            "./macros/keys/*.js",
            "./macros/mixins/*.js",
            "./macros/nodes/*.js",
            "./macros/traversal/*.js",
        ]).
        pipe(concat({path: 'macros.sjs.js'})).
        pipe(gulp.dest('tmp/framework'));
});

gulp.task('build.get.ops', function() {
    return gulp.
        src([
            'src/lru.js',
            'src/support.js',
            'src/hardlink.js',
            'src/followReference.js',
            'src/get-header.js',
            'src/get.js',
            'src/bridge.js'
        ]).
        pipe(concat({path: 'get.ops.js'})).
        pipe(gulp.dest('./tmp'));
});

gulp.task('build.operations', ['build.macros'], function() {
    return gulp.
        src(build.macroCompileFull).
        pipe(gulp.dest('tmp/framework/operations'));
});

gulp.task('build.compiled_operations', ['build.sweet'], function() {
    return support.buildOperations();
});

gulp.task('build.sweet', ['build.operations'], function() {
    return distributeSweetCompile();
});

gulp.task('build.support', ['build.macros'], function() {
    return gulp.
        src(build.support).
        pipe(concat({path: 'support.js'})).
        pipe(gulp.dest('tmp/framework'));
});

gulp.task('build.combine', ['build.compiled_operations', 'build.support'], function() {
    return gulp.src(build.compile).
        pipe(concat({path: 'Falcor.js'})).
        pipe(gulp.dest('tmp'));
});

gulp.task('build.akira', ['build.combine'], function() {
    return build('Falcor.akira.js', './bin', function(src) {
        return src.
            pipe(surround({
                prefix: 'import Rx from \'./rxUltraLite\';',
                postfix: 'export default falcor;'
            }));
    });
});


gulp.task('build.node', ['build.combine'], function() {
    return build('Falcor.js', './bin', function(src) {
        return src.
            pipe(surround({
                prefix: '\
var Rx = require(\'rx\');\n\
var Observable = Rx.Observable;\n',
                postfix: 'module.exports = falcor;'
            }));
    });
});

gulp.task('build.tvui', ['build.combine'], function() {
    return build('Falcor.tvui.js', './bin', function(src) {
        return src.
            pipe(surround({
                prefix: tvuiPrefix,
                postfix: tvuiPostfix
            }));
    });
});

gulp.task('build.browser', ['build.combine'], function() {
    return build('Falcor.browser.js', './bin', function(src) {
        return src.
            pipe(surround({
                prefix: 'var Rx = require(\'rx\');',
                postfix: 'module.exports = falcor;'
            })).
            pipe(browserify({
                standalone: 'falcor'
            }));
    });
});

gulp.task('build.raw', ['build.combine'], function() {
    return build('Falcor.raw.js', './bin', function(src) {
        return src.
            pipe(browserify({
                standalone: 'falcor'
            }));
    });
});

gulp.task('build.alone', ['build.combine'], function() {
    return build('Falcor.alone.js', './bin', function(src) {
        return src;
    });
});

gulp.task('prod.node', ['build.combine'], function() {
    return build('Falcor.js', './dist', function(src) {
        return src.
            pipe(surround({
                prefix: '\
var Rx = require(\'rx\');\n\
var Observable = Rx.Observable;\n',
                postfix: 'module.exports = falcor;'
            }));
    });
});

gulp.task('prod.tvui', ['build.combine'], function() {
    return build('Falcor.tvui.js', './dist', function(src) {
        return src.
            pipe(surround({
                prefix: tvuiPrefix,
                postfix: tvuiPostfix
            }));
    });
});

