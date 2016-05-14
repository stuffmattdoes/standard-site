// Gulp file
var gulp            = require('gulp'),
    devPath         = "./dev",
    distPath        = "./dist",
    scriptsArray    = [
        devPath + '/js/*/*.js',
        devPath + '/js/main.js'
    ],
    ignoreList  = [
        "*.git",
        "*.bin",
        ".gitignore",
        ".gitmodules",
        "*.DS_Store",
        "gulpfile.js",
        "package.json",
        "node_modules"
    ]
;

// Plugins
var 
    chalk       = require('chalk'),
    concat      = require('gulp-concat'),
    gutil       = require('gulp-util'),
    imageMin    = require('gulp-imagemin'),
    inquirer    = require('inquirer'),
    livereload  = require('gulp-livereload'),
    maps        = require('gulp-sourcemaps'),
    notifier    = require('node-notifier'),
    rename      = require('gulp-rename');
    rsync       = require('rsyncwrapper').rsync,
    sass        = require('gulp-sass'),
    uglify      = require('gulp-uglify'),    
;


// -------------------------------------------------
// ----------------- DEVELOPMENT -------------------
// -------------------------------------------------

// Default - watch for any changes
gulp.task('default', function() {
    gulp.watch(devPath + '/scss/**/*.scss', ['styles']);
    gulp.watch(devPath + '/js/**/*.js', ['scripts']);
    gulp.watch(distPath + '/img', ['images']);
});

gulp.task('styles', function() {
    return gulp.src(devPath + 'sass/main.scss')
        .pipe(maps.init())

        // // Create an unminified CSS file first
        // .pipe(sass({
        //     errLogToConsole: true,
        //     outputStyle: 'expanded'
        // }))
        // .pipe(gulp.dest('css/'))

        // Now create some minified CSS
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .pipe(maps.write(devPath + "/css"))

        // Rename it so we don't overwrite our unmin CSS
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('css/'));
});

gulp.task('scripts', function () {
    return gulp.src(scriptsArray)
        .pipe(maps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(maps.write(assetsPath))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(deistPath + '/js'));
});

gulp.task('images', function() {
    gulp.src(distPath + '/img')
    .pipe(imagemin)
    .pipe(gulp.dest(distPath + '/img'))
});

// -------------------------------------------------
// ----------------- Deployment --------------------
// -------------------------------------------------

// Deploy to server
gulp.task('deploystaging', function(callback) {
    inquirer.prompt({
        type: "confirm",
        name: 'deployConfirm',
        message: "You are about to deploy to dev. Are you sure you want to do this?",
        default: false
      }, function(answers) {
        if(answers.deployConfirm){
            rsync({
                ssh: true,
                src: distPath,
                dest: 'path/to/destination',
                recursive: true,
                deleteAll: true,
                args: ['--verbose', '--compress', '--archive'],
                dryRun: false,
                exclude: ignoreList
            },
            function(error, stdout, stderr, cmd) {
                if(error){
                    gutil.log('error: ', chalk.red(error));
                    notifier.notify({ message: 'rsync error' });
                    callback();
                }else{
                    gutil.log('rsync result: ','\n', chalk.gray(stdout));
                    notifier.notify({ message: 'rsync complete' });
                    callback();
                }
            });
        }else{
            gutil.log('that was close!');
            callback();
        }

    });
});