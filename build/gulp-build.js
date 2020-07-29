var gulp = require("gulp");
var browserify = require("browserify");
var license = require("gulp-license");
var uglify = require("gulp-uglify");
var vinyl = require("vinyl-source-stream");
var bundleCollapser = require("bundle-collapser/plugin");
var _ = require("lodash");
var path = require("path");

var licenseInfo = {
    organization: "Netflix, Inc",
    year: "2020",
};

var browserifyOptions = {
    standalone: "falcor",
    insertGlobalVars: {
        Promise: function(file, basedir) {
            return 'typeof Promise === "function" ? Promise : require("promise")';
        },
    },
};

function buildDistBrowser() {
    return build({
        file: ["./browser.js"],
        outName: "falcor.browser",
        browserifyOptions: browserifyOptions,
        debug: false,
    });
}

function buildBrowser() {
    return build({
        file: ["./browser.js"],
        outName: "falcor.browser",
        browserifyOptions: browserifyOptions,
    });
}

function buildDistAll() {
    return build({
        file: ["./all.js"],
        outName: "falcor.all",
        browserifyOptions: browserifyOptions,
        debug: false,
    });
}

function buildAll() {
    return build({
        file: ["./all.js"],
        outName: "falcor.all",
        browserifyOptions: browserifyOptions,
    });
}

function build(options) {
    options = _.assign(
        {
            file: "",
            browserifyOptions: {},
            outName: options.outName,
            dest: "dist",
            debug: true,
        },
        options
    );

    var name = options.outName + ((!options.debug && ".min") || "") + ".js";
    return browserify(options.file, options.browserifyOptions)
        .plugin(bundleCollapser)
        .bundle()
        .pipe(vinyl(name))
        .pipe(license("Apache", licenseInfo))
        .pipe(gulp.dest(options.dest))
        // eslint-disable-next-line consistent-return
        .on("finish", function() {
            if (!options.debug) {
                // minify output
                var destAndName = path.join(options.dest, name);
                return gulp.src(destAndName)
                    .pipe(uglify())
                    .pipe(gulp.dest(options.dest));
            }
        });
}

module.exports = {
    buildAll: buildAll,
    buildBrowser: buildBrowser,
    buildDistAll: buildDistAll,
    buildDistBrowser: buildDistBrowser,
};
