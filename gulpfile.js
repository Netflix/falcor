var gulp = require("gulp");
var gulpShell = require("gulp-shell");
var eslint = require("gulp-eslint");

var clean = require("./build/gulp-clean");
var build = require("./build/gulp-build");
var perf = require("./build/gulp-perf");

function lint() {
    return gulp.src(["*.js", "lib/**/*.js"]).
        pipe(eslint()).
        pipe(eslint.format()).
        pipe(eslint.failAfterError()); // dz: change back after finishing to failAfterError
}

function generateDocs() {
    return gulpShell.task("./node_modules/.bin/jsdoc lib -r -d doc -c ./build/jsdoc.json --verbose")();
}

module.exports = {
    build: gulp.series(clean.dist, lint, gulp.parallel(build.buildAll, build.buildBrowser, build.buildDistAll, build.buildDistBrowser)),
    clean: gulp.parallel(clean.bin, clean.coverage, clean.doc, clean.perf),
    doc: gulp.series(clean.doc, generateDocs),
    lint: lint,
    perfBuild: gulp.series(clean.perf, gulp.parallel(perf.buildBrowser, perf.buildDevice)),
    perfRun: gulp.series(clean.perf, gulp.parallel(perf.buildBrowser, perf.buildDevice), perf.runBrowser, perf.runNode),
};
