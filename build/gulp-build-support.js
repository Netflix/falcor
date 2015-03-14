var gulp = require('gulp');
var surround = require('./surround');
var concat = require('gulp-concat');
var build = require('./build');
gulp.task('build.support-only-compile', ['build.support-only-replace'], function() {
    return gulp.src(build.compile).
        pipe(concat({path: 'Falcor.js'})).
        pipe(gulp.dest('tmp'));
});

gulp.task('build.support-only-replace', function() {
    return gulp.
        src(build.support).
        pipe(concat({path: 'support.js'})).
        pipe(gulp.dest('tmp/framework'));
});

gulp.task('build.support-only', ['build.support-only-replace', 'build.support-only-compile'], function() {
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

