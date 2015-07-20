// Node module includes
var browserSync = require('browser-sync').create();
var childProcess = require('child_process');
var gulp = require('gulp');
var path = require('path');


// Gulp plugin includes
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var cache = require('gulp-cached');

// LESS plugin includes
var CleanCssPlugin = require("less-plugin-clean-css"),
    cleanCss = new CleanCssPlugin({advanced: true});

gulp.task('compile-less', function () {
  return gulp.src(['./less/falcor-site.less', './less/*.less'])
    .pipe(sourcemaps.init())
		.pipe(cache())
    .pipe(less({
      paths: [
				'./node_modules/bootstrap/less'
			],
			plugins: [cleanCss]
    }))
		.pipe(concat('falcor-site.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./stylesheets'))
		.pipe(browserSync.stream());
});

// Instead of waiting for jekyll to rebuild, compile
// the less and then copy the resulting css and maps
// into jekyll's build directory.
gulp.task('less', ['compile-less'], function () {
	browserSync.notify('Reloading CSS');
	return gulp.src('./stylesheets/*')
		.pipe(gulp.dest('_site/stylesheets'))
		.pipe(browserSync.stream());
});

var buildJekyllSite = function (complete) {
	var jekyll = childProcess.spawn('jekyll', ['build'], {stdio: 'inherit'});
	browserSync.notify('Rebuilding jekyll site');
	jekyll.on('close', function () {
		complete();
	});
};

// Builds just the jekyll site from the already-compiled css/js assets
gulp.task('jekyll', buildJekyllSite);

// Builds the less into css, then builds the jekyll site
gulp.task('build-all', ['less'], buildJekyllSite);

// Theoretically browserSync.reload should be the third argument, but it
// doesn't seem to reload reliably if placed here, despite working reliably
// if placed inside buildJekyllSite.
gulp.task('jekyll-watch', ['jekyll'], function () {
	browserSync.reload();
});
gulp.task('less-watch', ['less'], function () {
	return browserSync.stream({match: '**/*.css'});
});

gulp.task('serve', ['build-all'], function () {
	browserSync.init({
		server: {
			baseDir: "./_site"
		}
	});
	gulp.watch('./less/**/*.less', ['less-watch']);
	// Just rebuild the jekyll site to speed things up, and also because
	// rebuilding the less can trigger the less file watcher and create
	// infinite recompilation cycles. Since the LESS is always recompiled
	// on change, the site css will always be ready to build with jekyll.
	gulp.watch([
		'index.html',
		'_includes/*.html',
		'_layouts/*.html',
		'_posts/*',
		'*.md'
	], ['jekyll-watch']);
});