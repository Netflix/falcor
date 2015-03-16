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
    './framework/get/*.js',
    './framework/get/paths/*.js',
    './framework/get/pathMaps/*.js',
    './framework/set/*.js',
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
var recursiveFiles = [
    'src/lru.js',
    'src/support.js',
    'src/hardlink.js',
    'src/followReference.js',
    'src/get-header.js',
    'src/get.js',
    'src/bridge.js'
];
var operations = [
    'tmp/framework/compiled_operations/call.js',
    'tmp/framework/compiled_operations/getBoundContext.js',
    'tmp/framework/compiled_operations/getBoundValue.js',
    'tmp/framework/compiled_operations/getPathMapsAsJSON.js',
    'tmp/framework/compiled_operations/getPathMapsAsJSONG.js',
    'tmp/framework/compiled_operations/getPathMapsAsPathMap.js',
    'tmp/framework/compiled_operations/getPathMapsAsValues.js',
    'tmp/framework/compiled_operations/getPathsAsJSON.js',
    'tmp/framework/compiled_operations/getPathsAsJSONG.js',
    'tmp/framework/compiled_operations/getPathsAsPathMap.js',
    'tmp/framework/compiled_operations/getPathsAsValues.js',
    'tmp/framework/compiled_operations/getValueSync.js',
    'tmp/framework/compiled_operations/setValueSync.js',
    'tmp/framework/compiled_operations/invaldiatePathMaps.js', // Nice name bro
    'tmp/framework/compiled_operations/invalidatePaths.js',
    'tmp/framework/compiled_operations/setPathsAsJSON.js',
    'tmp/framework/compiled_operations/setPathsAsJSONG.js',
    'tmp/framework/compiled_operations/setPathsAsPathMap.js',
    'tmp/framework/compiled_operations/setPathsAsValues.js',
    'tmp/framework/compiled_operations/setPathMapsAsJSON.js',
    'tmp/framework/compiled_operations/setPathMapsAsJSONG.js',
    'tmp/framework/compiled_operations/setPathMapsAsPathMap.js',
    'tmp/framework/compiled_operations/setPathMapsAsValues.js',
    'tmp/framework/compiled_operations/setJSONGsAsJSON.js',
    'tmp/framework/compiled_operations/setJSONGsAsJSONG.js',
    'tmp/framework/compiled_operations/setJSONGsAsPathMap.js',
    'tmp/framework/compiled_operations/setJSONGsAsValues.js'
];
var recursiveOperations = [
    'tmp/framework/compiled_operations/call.js',
    'tmp/framework/compiled_operations/getBoundContext.js',
    'tmp/framework/compiled_operations/getBoundValue.js',
    'tmp/framework/compiled_operations/getValueSync.js',
    'tmp/framework/compiled_operations/setValueSync.js',
    'tmp/framework/compiled_operations/invaldiatePathMaps.js', // Nice name bro
    'tmp/framework/compiled_operations/invalidatePaths.js',
    'tmp/framework/compiled_operations/setPathsAsJSON.js',
    'tmp/framework/compiled_operations/setPathsAsJSONG.js',
    'tmp/framework/compiled_operations/setPathsAsPathMap.js',
    'tmp/framework/compiled_operations/setPathsAsValues.js',
    'tmp/framework/compiled_operations/setPathMapsAsJSON.js',
    'tmp/framework/compiled_operations/setPathMapsAsJSONG.js',
    'tmp/framework/compiled_operations/setPathMapsAsPathMap.js',
    'tmp/framework/compiled_operations/setPathMapsAsValues.js',
    'tmp/framework/compiled_operations/setJSONGsAsJSON.js',
    'tmp/framework/compiled_operations/setJSONGsAsJSONG.js',
    'tmp/framework/compiled_operations/setJSONGsAsPathMap.js',
    'tmp/framework/compiled_operations/setJSONGsAsValues.js'
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
build.recursiveFiles = recursiveFiles;

module.exports = build;
