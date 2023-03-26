const
  gulp = require('gulp'),
  cssImport = require('gulp-cssimport'),
  $ = require('gulp-load-plugins')();

const sass = require('gulp-sass')(require('sass'));


gulp.task('styles', function () {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(cssImport())
    .pipe(gulp.dest('public/styles'));
});
