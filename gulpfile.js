// Gulp file
var gulp            = require('gulp'),
    assetsPath      = "./",
    scriptsArray    = [
        assetsPath+'/js/*/*.js',
        assetsPath+'/js/main.js'
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
var sass        = require('gulp-sass');
    rsync       = require('rsyncwrapper').rsync,
    maps        = require('gulp-sourcemaps'),
    rename      = require('gulp-rename');
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    gutil       = require('gulp-util'),
    inquirer    = require('inquirer'),
    notifier    = require('node-notifier'),
    chalk       = require('chalk')
;


// -------------------------------------------------
// ----------------- DEVELOPMENT -------------------
// -------------------------------------------------

// Default - watch for any changes
gulp.task('default', function() {
    gulp.watch(assetsPath+'sass/*.scss',['styles']);
    gulp.watch(assetsPath+'/scss/*/*.scss', ['styles']);
    gulp.watch(assetsPath+'/js/*.js', ['scripts']);
    gulp.watch(assetsPath+'/js/*/*.js', ['scripts']);
});

// Compile SASS
gulp.task('styles', function() {
    return gulp.src(assetsPath+'sass/main.scss')
    	.pipe(maps.init())

        // Create an unminified CSS file first
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'expanded'
        }))
        .pipe(gulp.dest('css/'))

        // Now create some minified CSS
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .pipe(maps.write(assetsPath))

        // Rename it so we don't overwrite our unmin CSS
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('css/'));
});

// Get dat javascript, yo
gulp.task('scripts', function () {
    return gulp.src(scriptsArray)
        .pipe(maps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(maps.write(assetsPath))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('js/'));
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
                src: assetsPath,
                dest: 'prpl@75.112.170.213:/var/www/vhosts/jom-misc/digital-new-names/01',
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
                    // gutil.log('command run: ', chalk.magenta(cmd),'\n', 'you can also use this in the command line without gulp ^^^');
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