var gulp = require('gulp');
var surround = require('./surround');
var concat = require('gulp-concat');
var build = require('./build');
gulp.task('build.support-only-compile', ['build.support-only-replace'], function() {
    return buildSupportOnlyCompile();
});

gulp.task('build.support-only-replace', function() {
    return buildSupportOnlyReplace();
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

function buildSupportOnlyReplace() {
    return gulp.
        src(build.support).
        pipe(concat({path: 'support.js'})).
        pipe(gulp.dest('tmp/framework'));
}

function buildSupportOnlyCompile(compile, name, dest) {
    return gulp.src(compile || build.compile).
        pipe(concat({path: name || 'Falcor.js'})).
        pipe(gulp.dest(dest || 'tmp'));
}

module.exports = {
    buildSupportReplace: buildSupportOnlyReplace,
    buildSupportCompile: buildSupportOnlyCompile,
    buildOperations: function(name) {
        return gulp.
            src(build.operations).
            pipe(concat({path: name || 'operations.js'})).
            pipe(gulp.dest('tmp/framework'));
    },
    buildRecursiveOperations: function(name) {
        return gulp.
            src(build.recursiveOperations).
            pipe(concat({path: name || 'operations.rec.js'})).
            pipe(gulp.dest('tmp/framework'));
    }
};