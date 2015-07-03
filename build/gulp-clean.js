var gulp = require("gulp");
var clean = require("gulp-clean");

gulp.task("clean.perf", function() {
    return gulp.src(["./performance/bin", "./performance/out"]).
        pipe(clean());
});

gulp.task("clean.doc", function() {
    return gulp.src(["./doc"]).
        pipe(clean());
});

gulp.task("clean.bin", function() {
    return gulp.src(["./bin"]).
        pipe(clean());
});

gulp.task("clean.dist", function() {
    return gulp.src(["./dist"]).
        pipe(clean());
});

gulp.task("clean.coverage", function() {
    return gulp.src(["./coverage"]).
        pipe(clean());
});

gulp.task("clean", ["clean.doc", "clean.bin", "clean.coverage"]);
gulp.task("clean.dev", ["clean.bin"]);

