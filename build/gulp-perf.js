var gulp = require("gulp");
var concat = require("gulp-concat");
var vinyl = require("vinyl-source-stream");
var browserify = require("browserify");
var gulpShell = require("gulp-shell");
const { runner } = require("karma");

function buildDevice() {
    return browserify("./performance/device.js", { ignoreMissing: true })
        .bundle()
        .pipe(vinyl("device-body.js"))
        .pipe(gulp.dest("performance/bin"));
}

function polyfillDevice() {
    return gulp
        .src(["./node_modules/nf-falcor-device-perf/devicePolyfill.js", "performance/bin/device-body.js"], { allowEmpty: true })
        .pipe(concat({ path: "device.js" }))
        .pipe(gulp.dest("performance/bin"));
}

function buildBrowser() {
    return browserify("./performance/browser.js")
        .bundle()
        .pipe(vinyl("browser.js"))
        .pipe(gulp.dest("performance/bin"));
}

function runBrowser() {
    return gulpShell.task("karma start ./performance/karma.conf.js")();
}

function runNode() {
    return gulpShell.task("node --expose-gc ./performance/node.js")();
}

module.exports = {
    buildDevice: gulp.series(buildDevice, polyfillDevice),
    buildBrowser: buildBrowser,
    runBrowser: runBrowser,
    runNode: runNode,
};
