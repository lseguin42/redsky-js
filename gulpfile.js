var gulp       = require('gulp');
var minify     = require('gulp-minify');
var concat     = require('gulp-concat');
var bowerFiles = require('main-bower-files');

var srcs = [
    'src/**/*.js'
];

gulp.task('build', function () {
    var files = bowerFiles({includeDev: 'exclusive'})
		.concat(srcs);

    return gulp.src(files)
	.pipe(concat('redsky.js'))
	.pipe(gulp.dest('lib'))
	.pipe(minify())
	.pipe(concat('redsky.min.js'))
	.pipe(gulp.dest('lib'))
});
