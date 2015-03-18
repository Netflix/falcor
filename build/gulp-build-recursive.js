var gulp = require('gulp');
var distributeSweetCompile = require('./distribute-sweet-compile');
var surround = require('./surround');
var concat = require('gulp-concat');
var build = require('./build');
var support = require('./gulp-build-support');

gulp.task('build.recurse', ['clean.dev', 'build.node-recurse']);
gulp.task('build.s.recurse', ['build.support-only-recurse']);

gulp.task('build.operations-recurse', ['build.macros'], function() {
    return gulp.
        src(build.macroCompileWithRecursiveSubstitutes).
        pipe(gulp.dest('tmp/framework/operations'));
});

gulp.task('build.compiled_operations-recurse', ['build.sweet-recurse', 'build.get.ops'], function() {
    return support.buildRecursiveOperations();
});

gulp.task('build.sweet-recurse', ['build.operations-recurse'], function() {
    return distributeSweetCompile();
});

gulp.task('build.combine-recurse', ['build.compiled_operations-recurse', 'build.support'], function() {
    return gulp.src(build.compileWithGetOps).
        pipe(concat({path: 'Falcor.js'})).
        pipe(gulp.dest('tmp'));
});

gulp.task('build.node-recurse', ['build.combine-recurse'], function() {
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

gulp.task('build.support-only-compile-recurse', ['build.get.ops', 'build.support-only-replace'], function() {
    return support.buildSupportCompile(build.compileWithGetOps);
});

gulp.task('build.support-only-recurse', ['build.support-only-replace', 'build.support-only-compile-recurse'], function() {
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
