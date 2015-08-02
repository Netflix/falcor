// Node module includes
var browserSync = require('browser-sync').create();
var childProcess = require('child_process');
var gulp = require('gulp');


// Gulp plugin includes
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// LESS plugin includes
var CleanCssPlugin = require('less-plugin-clean-css'),
    cleanCss = new CleanCssPlugin();

gulp.task('compile-less', function () {
	var lessProcessor = less({
		paths: [
			'./node_modules/bootstrap/less'
		],
		plugins: [cleanCss]
	});
	lessProcessor.on('error', function (error) {
		console.error(error);
		lessProcessor.end();
	});
	
  return gulp.src(['./less/falcor-site.less', './less/*.less'])
    .pipe(sourcemaps.init())
		.pipe(lessProcessor)
		.pipe(autoprefixer({
			browsers: [
				'> 1%',
				'last 2 versions',
				'ie >= 9'
			]
		}))
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
		.pipe(gulp.dest('_site/stylesheets'));
});

gulp.task('js', function () {
	return gulp.src('./javascripts/bootstrap-modified.js')
    .pipe(uglify())
    .pipe(rename('bootstrap-modified.min.js'))
		.pipe(gulp.dest('./javascripts'));
});

var buildJekyllSite = function (complete) {
	var jekyll = childProcess.spawn('jekyll', ['build', '--verbose'], {stdio: 'inherit'});

	browserSync.notify('Rebuilding jekyll site');
	jekyll.on('close', function () {
		complete();
	});
};

// Builds just the jekyll site from the already-compiled css/js assets
gulp.task('jekyll', buildJekyllSite);

// Builds the less into css, then builds the jekyll site
gulp.task('build-all', ['compile-less', 'js'], buildJekyllSite);

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
			// baseDir is required but we only want routes starting with /falcor
			// to work so it's as close to real gh-pages hosting as possible to
			// simplify local testing
			baseDir: '.',
			routes: {
				'/falcor': '_site',
			}
		},
		startPath: '/falcor'
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
		'images/*',
		'javascripts/*',
		'**/*.md',
		'_config.yml',
		'_data/**/*.yml',
		'!_site/**/*'
	], ['jekyll-watch']);
});