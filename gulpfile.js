/* eslint-disable hapi/hapi-scope-start */
'use strict';

const gulp = require('gulp');
const path = require('path');
const $g = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'postcss-*', 'del']
});
$g.uglify = require('gulp-uglify-es').default;
const Handlebars = require('handlebars');

// JavaScript and CSS which get processed (e.g. concatenated, minified)
const internals = {
    js: [
        'app/client/js/*.js',
        'app/client/js/**/*.js'
    ],
    css: [
        'app/client/css/*.scss',
        'app/client/css/**/*.scss'
    ]
};


// Assets that are simply copied
internals.assets = [
    {
        src  : 'app/client/images/**/*',
        dest : 'public/images'
    },
    {
        src  : 'app/client/robots.txt',
        dest : 'public'
    }
];


// -----------------------------------------------------------------------------
gulp.task('clean', (cb) => $g.del(['public'], cb));


// Note: To have the process exit with an error code (1) on
// lint error, return the stream and pipe to failOnError last.
gulp.task('lint:js', () => gulp.src(
    [
        '*.js',
        'app/client/js/**/*.js',
        'app/server/**/*.js'
    ])
    .pipe($g.eslint())
    .pipe($g.eslint.format())
    .pipe($g.eslint.failAfterError())
);


gulp.task('lint:scss', () => {

    const stylelint = require('stylelint');
    return gulp.src([
        'app/client/css/**/*.scss',
        '!app/client/css/_variables.scss',
        '!app/client/css/styles.scss'
    ])
        .pipe($g.postcss(
            [
                stylelint(),
                $g.reporter({ clearMessages: true })
            ],
            { syntax: $g.scss }
        ));
});


gulp.task('build', ['assets', 'js', 'css']);


gulp.task('build', ['assets', 'js:app', 'css:app']);


gulp.task('watch', ['build'], () => {

    gulp.watch(internals.js, ['js:app']);
    gulp.watch(internals.css, ['css:app']);
});


// -- Assets -------------------------------------------------------------------
gulp.task('assets', () => internals.assets.map((asset) =>
    gulp.src(asset.src).pipe(gulp.dest(asset.dest))));


// -- CSS ----------------------------------------------------------------------
gulp.task('css:app', () => gulp.src(internals.css)
    .pipe($g.sourcemaps.init())
    .pipe($g.sass({
        precision: 10,
        outputStyle: 'compressed'
    }))
    .pipe($g.cssnano())
    .pipe($g.autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe($g.rename({ suffix: '.min' }))
    .pipe($g.sourcemaps.write('./sourcemaps'))
    .pipe(gulp.dest('public/css')));

// -- JavaScript ---------------------------------------------------------------
gulp.task('js:app', () => gulp.src(internals.js)
    .pipe($g.eslint())
    .pipe($g.eslint.format())
    .pipe($g.eslint.failAfterError())
    .pipe($g.sourcemaps.init())
    .pipe($g.concat('scripts.min.js'))
    .pipe($g.uglify())
    .pipe($g.sourcemaps.write('./sourcemaps'))
    .pipe(gulp.dest('public/js')));
