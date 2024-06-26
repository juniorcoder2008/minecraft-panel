// Initialize all node modules
const gulp = require('gulp');
const uglifycss = require('gulp-uglifycss');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const browsersync = require('browser-sync').create();
const autoprefixer = require('autoprefixer');
const browserify = require('gulp-browserify');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');

// Initialize The Gulp Sass Module
const sass = require('gulp-sass')(require('node-sass'));

// Basic Functions for Browsersync
const reloadServer = (done) => {
    browsersync.reload();
    done();
};

const startServer = (done) => {
    browsersync.init({
        server: {
            baseDir: './dist/',
        },
        notify: false,
    });
    done();
};

// Compile and minify functions
const compileCss = () => {
    const plugins = [autoprefixer(), cssnano()];

    return gulp
        .src('./app/style/**/*.sass')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(uglifycss())
        .pipe(rename({ basename: 'style', suffix: '.min' }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('./dist/css'));
};

const copyAssets = () => {
    return gulp.src('./app/assets/**/*').pipe(gulp.dest('./dist/assets'));
};

const compileHTML = () => {
    return gulp
        .src('./app/*.html')
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                html5: true,
                removeComments: true,
                removeEmptyAttributes: true,
                sortAttributes: true,
                sortClassName: true,
                minifyURLs: true,
            })
        )
        .pipe(gulp.dest('./dist/'));
};

const compileJS = () => {
    return gulp
        .src('./app/js/**/*.js')
        .pipe(plumber())
        .pipe(
            browserify({
                insertGlobals: true,
            })
        )
        .pipe(concat('global.min.js'))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('./dist/js'));
};

// Important for the execution of the different functions
const watch = () => {
    gulp.watch(
        [
            './app/style/**/*.sass',
            './app/js/**/*.js',
            './app/**/*.html',
            './app/assets/*',
        ],
        gulp.series(
            compileJS,
            compileCss,
            compileHTML,
            copyAssets,
            reloadServer
        )
    );
};

const start = gulp.series(
    compileJS,
    compileCss,
    compileHTML,
    copyAssets,
    startServer,
    watch
);

const build = gulp.series(compileJS, compileCss, compileHTML, copyAssets);

exports.start = start;
exports.build = build;
exports.default = build;
