var gulp = require("gulp");
var clean = require("del");

gulp.task("clean.perf", function(cb) {
    clean(["./performance/bin", "./performance/out"], cb);
});

gulp.task("clean.doc", function(cb) {
    clean(["./doc"], cb);
});

gulp.task("clean.bin", function(cb) {
    clean(["./bin"], cb);
});

gulp.task("clean.dist", function(cb) {
    clean(["./dist"], cb);
});

gulp.task("clean.coverage", function(cb) {
    clean(["./coverage"], cb);
});

gulp.task("clean", ["clean.doc", "clean.bin", "clean.coverage", "clean.perf"]);
gulp.task("clean.dev", ["clean.bin"]);

