var gulp = require('gulp');
var rename = require('gulp-rename');
var license = require('gulp-license');
var concat = require('gulp-concat');
var licenseInfo = {
    organization: 'Netflix, Inc',
    year: '2014'
};
var support = [
    './framework/ModelResponse.js',
    './framework/request/Scheduler.js',
    './framework/request/RequestQueue.js',
    './framework/modelOperation.js',
    './framework/Model.js',
    './framework/PathLibrary.js'
];
var compile = [
    './framework/Falcor.js',
    './tmp/framework/Model.js',
    './tmp/framework/support.js',
    './tmp/framework/operations.js'
];
var compileWithGetOps = [
    './framework/Falcor.js',
    './tmp/get.ops.js',
    './tmp/framework/Model.js',
    './tmp/framework/support.js',
    './tmp/framework/operations.js'
];
var macroCompileFull = [
    './framework/get/paths/*.js',
    './framework/get/pathMaps/*.js',
    './framework/set/paths/*.js',
    './framework/set/pathMaps/*.js',
    './framework/set/jsong/*.js',
    './framework/call/call.js',
    './framework/invalidate/*.js'
];
var macroCompileWithRecursiveSubstitutes = [
    './framework/get/*.js',
    './framework/set/*.js',
    './framework/set/paths/*.js',
    './framework/set/pathMaps/*.js',
    './framework/set/jsong/*.js',
    './framework/call/call.js',
    './framework/invalidate/*.js'
];
var operations = [
    'tmp/framework/compiled_operations/*.js',
];
var recursiveOperations = [
    'tmp/framework/compiled_operations/*.js',
];
var build = function(name, dest, addBuildStep, extraSrc) {
    extraSrc = extraSrc || [];
    addBuildStep = addBuildStep || function() {};
    var src = gulp.
        src(extraSrc.concat([
            './tmp/Falcor.js'
        ])).
        pipe(concat({path: 'Falcor.js'}));
    return addBuildStep(src).
        pipe(license('Apache', licenseInfo)).
        pipe(rename(name)).
        pipe(gulp.dest(dest));
};
build.macroCompileWithRecursiveSubstitutes = macroCompileWithRecursiveSubstitutes;
build.macroCompileFull = macroCompileFull;
build.compileWithGetOps = compileWithGetOps;
build.compile = compile;
build.support = support;
build.licenseInfo = licenseInfo;
build.operations = operations;
build.recursiveOperations = recursiveOperations;
debugger;

module.exports = build;
