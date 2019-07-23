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
var DEV = '../app';
var WORKSPACE = './';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};
var dev = function(subpath) {
  //This function may not be usefull because many of the functions needing the 
  //DEV path, use globs and were all called string path, not sure if type matters
  return !subpath ? DEV : path.join(DEV, subpath);
}

var styleTask = function(stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('../app', stylesPath, src);
    }))
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('../app/.tmp/' + stylesPath))
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
  return gulp.src(src)
    //.pipe(assets)
    .pipe(useref({ 
      searchPath: ['../app/.tmp', '../app/assets']
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
  return styleTask('assets/styles', ['**/*.css']);
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
  return imageOptimizeTask('../app/assets/images/**/*', dist('assets/images'));
});

// Copy all files at assets level
gulp.task('assetscopy', function() {
  var app = gulp.src([
     '../app/assets/*',
     '!../app/index.html',     
     '!../app/assets/test',
     '!../app/assets/elements',
     '!../app/assets/bower_components',
     '!../app/assets/cache-config.json',
     '!**/.DS_Store'
   ], {
     dot: true
   }).pipe(gulp.dest(dist('assets')));
  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  var bower = gulp.src([
    '../app/assets/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  ]).pipe(gulp.dest(dist('assets/bower_components')));

  return merge(app, bower)
    .pipe($.size({
      title: 'assetscopy'
    }));
});
    
// Copy web fonts to dist
gulp.task('fonts', function() {
  return gulp.src(['../app/assets/fonts/**'])
    .pipe(gulp.dest(dist('assets/fonts')))
    .pipe($.size({
      title: 'fonts'
    }));
});

gulp.task('scripts', function() {
  return gulp.src(['../app/assets/scripts/**'])
    .pipe(gulp.dest(dist('assets/scripts')))
    .pipe($.size({
      title: 'scripts'
    }));
});

// Scan your root HTML for assets & optimize them
gulp.task('roothtml', function() {
  return optimizeHtmlTask(
    ['../app/index.html'],
    dist());
});

// Scan your assets HTML for assets & optimize them
gulp.task('assetshtml', function() {
  return optimizeHtmlTask(
    ['../app/assets/**/*.html', '!../app/assets/{elements,test,bower_components}/**/*.html'],
    dist('assets'));
});

// Vulcanize granular configuration
gulp.task('vulcanize', function() {
  return gulp.src('../app/assets/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest(dist('assets/elements')))
    .pipe($.size({title: 'vulcanize'}));
});

// Clean output directory 
/*Requires options {force:true} if dist is outside project directory */
gulp.task('clean', function() {
  return del(['../app/.tmp', dist()],{force:true});
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    ['ensureFiles', 'assetscopy', 'styles',],
    ['images', 'fonts', 'scripts', 'roothtml', 'assetshtml'],
    'vulcanize', cb);
});

/*****
 * NOTES: 
 * This gulpfile is adapted from Polymer 1.3 PSK
 * - gulp serve and reload are only used for local development
 * - Deploy to GitHub pages gh-pages is removed and not used
 * - Application file structure has been changed from the original Poly 1.3 PSK
 *   to the file structure shown below (service-worker is not used)
 * root |
 *      |- dist      |
 *                   |index.html,noscript.html,favicon.ico, manifest.json,robots.txt
 *                   |assets|
 *                          |bower_components,elements,fonts,images,scripts,styles
 *      |- app       |
 *                   |index.html,noscript.html,favicon.ico,manifest.json,robots.txt
 *                   |assets|
 *                          |bower_components,elements,fonts,images,scripts,styles
 *      |- workspace | gulpfile.js
 *                   | node_modules
 *                   | 
 * *******************
 
 * - Site is published to the web via an organizations git hub pages
 * - Public webaccess is managed through cloudflare workers
 *   Copy of the source code for cf workers can be found under /workspace/cfworkers
 * *****/

// Serve from development environment, do not watch files for reload
gulp.task('serve', ['styles'], function() {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    https: true,
    server: {
      baseDir: ['../app/.tmp', '../app'],
      middleware: [historyApiFallback()]
    }
  });
});
 
// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    https: true,
    server: dist(),
    middleware: [historyApiFallback()]
  });
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {
  // Do nothing
}
