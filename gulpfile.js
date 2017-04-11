var runSequence = require('run-sequence');
var del = require('del');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var SRC = './src';
var DEST = './dist';

function clean()
{
    return del([DEST]);
}

function sass()
{
    return gulp.src([
        SRC + '/assets/sass/email.scss',
        SRC + '/assets/sass/outlook.scss',
    ])
    .pipe(plugins.sassGlob({
        ignorePaths: [
            '**/__*.scss'
        ]
    }))
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(gulp.dest(SRC + '/assets/css'));
}

function emailbuilder()
{
    var twig_options = {
        base : SRC,
        errorLogToConsole : true
    }

    return gulp.src([
        SRC + '/**/*.twig',
        '!' + SRC + '/**/layouts/**/*.twig',
        '!' + SRC + '/**/partials/*.twig',
        '!' + SRC + '/**/modules/*.twig',
    ])
    .pipe(plugins.plumber())
    .pipe(plugins.twig(twig_options))
    .pipe(plugins.emailBuilder().build())
    .pipe(gulp.dest(DEST));
}

function connect()
{
    plugins.connect.server({
        root: DEST,
        livereload: true
    });
}

gulp.task('clean', function() {
   return clean();
});

gulp.task('styles', function() {
    return sass();
});

gulp.task('emailtemplates', function() {
    return emailbuilder();
});

gulp.task('connect', function() {
    return connect();
});

gulp.task('watch', function() {
    plugins.watch([
            SRC + '/assets/**/*.scss',
            SRC + '/**/*.twig',
        ], function() {
            gulp.start('default');
        }
    );
});

gulp.task('default', function(callback) {
    runSequence(
        'styles',
        'emailtemplates',
        callback
    );
});

gulp.task('serve', function(callback) {
    gulp.start('default');
    gulp.start('connect');
    gulp.start('watch');
});