var gulp = require('gulp');
var eslint = require('gulp-eslint');
var runSequence = require('run-sequence');
var concat = require('gulp-concat');
var benchmark = require('gulp-bench');
var gulpShell = require('gulp-shell');

// Registers build tasks
require('./build/gulp-clean');
require('./build/gulp-build');
require('./build/gulp-test');
require('./build/gulp-perf');

var srcDir = 'lib';

gulp.task('lint', function() {
    return gulp.src(srcDir + '/**/*.js').
        pipe(eslint({
            globals: {
                'require': false,
                'module': false
            },
            reset: true, // dz: remove me after linting is finished, else i can't do one at the time
            useEslintrc: true,
        })).
        pipe(eslint.format()).
        pipe(eslint.failOnError()); // dz: change back after finishing to failAfterError
});

gulp.task('doc', ['clean.doc', 'doc-d']);

gulp.task('doc-d', gulpShell.task([
    './node_modules/.bin/jsdoc lib -r -d doc -c ./build/jsdoc.json --verbose'
]));

// Run in serial to fail build if lint fails.
gulp.task('default', function(callback) {
    return runSequence('lint', 'build', callback);
});
