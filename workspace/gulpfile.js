/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include promise polyfill for node 0.10 compatibility
require('es6-promise').polyfill();

// Include Gulp & tools we'll use
var gulp = require('gulp');
var useref = require('gulp-useref');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var historyApiFallback = require('connect-history-api-fallback');
var packageJson = require('./package.json');
var crypto = require('crypto');
var ensureFiles = require('./tasks/ensure-files.js');

// var ghPages = require('gulp-gh-pages');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DIST = '../dist';
var DEV = '../dev';
var WORKSPACE = './';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var styleTask = function(stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('app', stylesPath, src);
    }))
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe($.minifyCss())
    .pipe(gulp.dest(dist(stylesPath)))
    .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = function(src, dest) {
  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = function(src, dest) {
  //console.log(useref());
  //var assets = useref.assets({
  //  searchPath: ['.tmp', 'app']
  //});

  return gulp.src(src)
    //.pipe(assets)
    .pipe(useref({ 
      searchPath: ['.tmp', 'app']
    }))
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    //.pipe(assets.restore())
    .pipe(useref())
    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({
      title: 'html'
    }));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
  return styleTask('styles', ['**/*.css']);
});
gulp.task('styles2', function() {
  return styleTask('src/styles', ['**/*.css']);
});
// Ensure that we are not missing required files for the project
// "dot" files are specifically tricky due to them being hidden on
// some systems.
gulp.task('ensureFiles', function(cb) {
  var requiredFiles = ['.bowerrc'];

  ensureFiles(requiredFiles.map(function(p) {
    return path.join(__dirname, p);
  }), cb);
});

// Optimize images
gulp.task('images', function() {
  return imageOptimizeTask('app/images/**/*', dist('images'));
});
gulp.task('images2', function() {
  return imageOptimizeTask('app/src/images/**/*', dist('src/images'));
});

// Copy all files at the root level (app)
gulp.task('copy', function() {
  var app = gulp.src([
    'app/*',
    '!app/test',
    '!app/elements',
    '!app/bower_components',
    '!app/cache-config.json',
    '!**/.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest(dist()));

  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  var bower = gulp.src([
    'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  ]).pipe(gulp.dest(dist('bower_components')));

  return merge(app, bower)
    .pipe($.size({
      title: 'copy'
    }));
});

// Copy all files at the root level (src)
gulp.task('copy2', function() {
  var app = gulp.src([
    'app/src/*',
     '!app/src/test',
     '!app/src/elements',
     '!app/src/bower_components',
     '!app/src/cache-config.json',
     '!**/.DS_Store'
   ], {
     dot: true
   }).pipe(gulp.dest(dist('src')));
  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  var bower = gulp.src([
    'app/src/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  ]).pipe(gulp.dest(dist('src/bower_components')));

  return merge(app, bower)
    .pipe($.size({
      title: 'copy2'
    }));
});
    

// Copy web fonts to dist
gulp.task('fonts', function() {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest(dist('fonts')))
    .pipe($.size({
      title: 'fonts'
    }));
});
// Copy web fonts to dist
gulp.task('fonts2', function() {
  return gulp.src(['app/src/fonts/**'])
    .pipe(gulp.dest(dist('src/fonts')))
    .pipe($.size({
      title: 'fonts2'
    }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  return optimizeHtmlTask(
    ['app/**/*.html', '!app/{elements,test,bower_components}/**/*.html'],
    dist());
});

// Scan your HTML for assets & optimize them might not need it!!
gulp.task('html2', function() {
  return optimizeHtmlTask(
    ['app/src/**/*.html', '!app/src/{elements,test,bower_components}/**/*.html'],
    dist('src'));
});

// Vulcanize granular configuration
gulp.task('vulcanize', function() {
  return gulp.src('app/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest(dist('elements')))
    .pipe($.size({title: 'vulcanize'}));
});

// Vulcanize granular configuration
gulp.task('vulcanize2', function() {
  return gulp.src('app/src/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest(dist('src/elements')))
    .pipe($.size({title: 'vulcanize2'}));
});

// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', function(callback) {
  var dir = dist();
  var config = {
    cacheId: packageJson.name || path.basename(__dirname),
    disabled: false
  };

  glob([
    'index.html',
    './',
    'bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '{elements,scripts,styles}/**/*.*'],
    {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache));
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

// Clean output directory 
/*Requires options {force:true} if dist is outside project directory */
gulp.task('clean', function() {
  return del(['.tmp', dist()],{force:true});
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  // Uncomment 'cache-config' if you are going to use service workers.
  runSequence(
    ['ensureFiles', 'copy', 'copy2', 'styles', 'styles2',],
    ['images', 'images2', 'fonts', 'fonts2', 'html', 'html2'],
    'vulcanize', 'vulcanize2', // 'cache-config',
    cb);
});

/*****
 * NOTES: 
 * This gulpfile is adapted from Polymer 2.0 PSK
 * - Not using `gulp serve` or livereload
 * - Deploy to GitHub pages gh-pages is removed and not used
 * Application directory structure has changed to:
 * root |
 *      |- dist      |
 *                   |-app |index.html,noscript.html,favicon.ico, manifest.json,robots.txt
 *                         |tests | 
 *                         |src   |
 *                                |bower_components,elements,fonts,images,scripts,styles
 *      |- workspace | --- app dir shown below will later be renamed dev and moved to root/dev
 *                   |-app |index.html,noscript.html,favicon.ico,manifest.json,robots.txt
 *                         |tests | 
 *                         |src   |
 *                                |bower_components,elements,fonts,images,scripts,styles
 * *******************
 
 * - GitHub static page is served from the master:root
 * - Public webaccess is managed through cloudflare workers


/****
 * Deploy to GitHub pages gh-pages branch
 *  Github organizations do not have gh-pages - this is not used
 *  If deploying to github pages on organization this will not work
 * ******/

 // Build then deploy to GitHub pages gh-pages branch
 //gulp.task('build-deploy-gh-pages', function(cb) {
 // runSequence(
 //   'default',
 //   'deploy-gh-pages',
 //   cb);
 //});
 //gulp.task('deploy-gh-pages', function() {
  // return gulp.src(dist('**/*'))
  // Check if running task from Travis CI, if so run using GH_TOKEN
  // otherwise run using ghPages defaults.
  // .pipe($.if(process.env.TRAVIS === 'true', $.ghPages({
    //    remoteUrl: 'https://$GH_TOKEN@github.com/polymerelements/polymer-starter-kit.git',
    //    silent: true,
    //    branch: 'gh-pages'
  // }), $.ghPages()));
//});

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {
  // Do nothing
}
