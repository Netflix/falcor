var gulp = require("gulp");
var clean = require("gulp-clean");

gulp.task("clean.tmp", function() {
    return gulp.src(["./tmp"]).
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

gulp.task("clean", ["clean.tmp", "clean.doc", "clean.bin", "clean.coverage"]);
gulp.task("clean.dev", ["clean.tmp", "clean.bin"]);

