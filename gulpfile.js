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
    // chalk       = require('chalk'),
    concat      = require('gulp-concat'),
    // gutil       = require('gulp-util'),
    imagemin    = require('gulp-imagemin'),
    // inquirer    = require('inquirer'),
    livereload  = require('gulp-livereload'),
    maps        = require('gulp-sourcemaps'),
    // notifier    = require('node-notifier'),
    rename      = require('gulp-rename');
    // rsync       = require('rsyncwrapper').rsync,
    sass        = require('gulp-sass'),
    uglify      = require('gulp-uglify')
;


// -------------------------------------------------
// ----------------- DEVELOPMENT -------------------
// -------------------------------------------------

// Default - watch for any changes
gulp.task('default', ['styles', 'scripts', 'images'], function() {
    gulp.watch(devPath + '/scss/**/*.scss', ['styles']);
    gulp.watch(devPath + '/js/**/*.js', ['scripts']);
    gulp.watch(distPath + '/img/original/**', ['images']);
});

gulp.task('styles', function() {
    return gulp.src(devPath + '/scss/main.scss')
        .pipe(maps.init())

        // Now create some minified CSS
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compressed'
        }))

        // Rename it so we don't overwrite our unmin CSS
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(distPath + '/css/'))
        .pipe(livereload());
});

gulp.task('scripts', function () {
    return gulp.src(devPath + '/js/**/*.js')
        .pipe(maps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(distPath + '/js/'))
        .pipe(livereload());
});

gulp.task('images', function() {
    gulp.src(distPath + '/img/original/**')
    .pipe(imagemin())
    .pipe(gulp.dest(distPath + '/img/min/'))
    .pipe(livereload());
});

// -------------------------------------------------
// ----------------- Deployment --------------------
// -------------------------------------------------

// Deploy to server
// gulp.task('deploystaging', function(callback) {
//     inquirer.prompt({
//         type: "confirm",
//         name: 'deployConfirm',
//         message: "You are about to deploy to dev. Are you sure you want to do this?",
//         default: false
//       }, function(answers) {
//         if(answers.deployConfirm){
//             rsync({
//                 ssh: true,
//                 src: distPath,
//                 dest: 'path/to/destination',
//                 recursive: true,
//                 deleteAll: true,
//                 args: ['--verbose', '--compress', '--archive'],
//                 dryRun: false,
//                 exclude: ignoreList
//             },
//             function(error, stdout, stderr, cmd) {
//                 if(error){
//                     gutil.log('error: ', chalk.red(error));
//                     notifier.notify({ message: 'rsync error' });
//                     callback();
//                 }else{
//                     gutil.log('rsync result: ','\n', chalk.gray(stdout));
//                     notifier.notify({ message: 'rsync complete' });
//                     callback();
//                 }
//             });
//         }else{
//             gutil.log('that was close!');
//             callback();
//         }

//     });
// });