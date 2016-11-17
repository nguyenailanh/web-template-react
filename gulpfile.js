//________________________________________________
//                                         REQUIRE
const config = require('./config.js');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')({
  pattern: ['*'],
  scope: ['devDependencies']
});



//________________________________________________
//                                   CORE VARIABLE
const paths = config.paths;
const options = config.options;
const ftp = config.ftp;
const run = plugins.sequence.use(gulp);
const args = plugins.yargs.argv;
const log = console.log;



//________________________________________________
//                                        VARIABLE
let buildErr = [];



//________________________________________________
//                                    HANDLE EVENT
const handleError = function handleError(err) {
  let errObj = {
    plugin: err.plugin.toUpperCase(),
    message: err.message.trim(),
    code: err.codeFrame || ''
  };

  buildErr.push(errObj);
  typeof this.emit === 'function' && this.emit('end');
}



//________________________________________________
//                                        FUNCTION
const functions = {

  pushPath(src, paths, notInclude) {
    let unitArr = [].concat(paths || []),
        tmpArr = [],
        notChar = notInclude ? '!' : '';

    if (unitArr.length !== 0) {
      tmpArr = unitArr.map(item => {
        return notChar + src + item;
      });
    }

    return tmpArr;
  },

  addPath(src, paths, notIncludePaths) {
    let tmpPath,
        pushPath = this.pushPath;

    try {
      if (typeof src === 'undefined') throw '';
      if (typeof paths === 'undefined') throw src;
      tmpPath = pushPath(src, paths, false).concat(pushPath(src, notIncludePaths, true));
    } catch (altSrc) {
      tmpPath = altSrc + '**/*';
    }

    return tmpPath;
  },

  clearCache(name) {
    return name
      ? delete plugins.cached.caches[name]
      : plugins.cached.caches = {};
  }

};



//________________________________________________
//                                           TASKS
gulp.task('clean', () => { // CLEAN
  functions.clearCache();
  return plugins.del(paths.dest);
});



gulp.task('serve', () => { // BROWSER SYNC
  let CSSPath = functions.addPath(paths.srcStyle, '**/*.scss', '_*/**/*'),
      HTMLPath = functions.addPath(paths.srcView, '**/*.pug', '_*/**/*'),
      JSPath = functions.addPath(paths.srcScript, '**/*.jsx', '_*/**/*');

  plugins.browserSync.init(options.browserSync(args.sync));

  //----- SASS --------------------
  gulp.watch(CSSPath, ['watch-sass']);

  gulp.watch(paths.srcStyle + '_cores/**/*.scss', ['watch-sass', 'watch-sass-app'])
    .on('change', () => functions.clearCache('sass'));

  gulp.watch(paths.srcStyle + '_partial/**/*.scss', ['watch-sass-app']);

  //----- HTML --------------------
  gulp.watch(HTMLPath, ['watch-pug']);

  gulp.watch(paths.srcView + '_*/**/*.pug', ['watch-pug'])
    .on('change', () => functions.clearCache('pug'));

  //----- JS --------------------
  gulp.watch(JSPath, ['watch-js'])
    .on('change', plugins.browserSync.reload);

  gulp.watch(paths.srcScript + '_lib/**/*.js', ['watch-js-lib'])
    .on('change', plugins.browserSync.reload);

  gulp.watch(paths.srcScript + '_partial/**/*.jsx', ['watch-js-app'])
    .on('change', plugins.browserSync.reload);

  //----- ASSETS --------------------
  gulp.watch(paths.srcAsset + '**/*', ['watch-copy'])
    .on('change', plugins.browserSync.reload);
});



gulp.task('sass',  () => { // SASS & AUTO PREFIXER
  let sassSrc = functions.addPath(paths.srcStyle, '**/*.scss', '_*/**/*'),
      sassOptions = options.sass(args.release),
      autoprefixOptions = options.autoprefixer();

  return gulp.src(sassSrc)
    .pipe(plugins.cached('sass'))
    .pipe(plugins.sass(sassOptions))
    .on('error', handleError)
    .pipe(plugins.autoprefixer(autoprefixOptions))
    .pipe(gulp.dest(paths.destStyle))
    .pipe(plugins.browserSync.stream());
});



gulp.task('sass-app', () => { // SASS APP FOLDER & CONCAT & AUTO PREFIXER
  let sassSrc = functions.addPath(paths.srcStyle, '_partial/**/*.scss'),
      sassOptions = options.sass(args.release),
      autoprefixOptions = options.autoprefixer();

  return gulp.src(sassSrc)
    .pipe(plugins.sass(sassOptions))
    .on('error', handleError)
    .pipe(plugins.autoprefixer(autoprefixOptions))
    .pipe(plugins.concat('apps.css'))
    .pipe(gulp.dest(paths.destStyle))
    .pipe(plugins.browserSync.stream());
});



gulp.task('pug', () => { // PUG
  let pugSrc = functions.addPath(paths.srcView, '**/*.pug', '_*/**/*'),
      pugOptions = options.pug(args.release);

  return gulp.src(pugSrc)
    .pipe(plugins.cached('pug'))
    .pipe(plugins.pug(pugOptions))
    .on('error', handleError)
    .pipe(gulp.dest(paths.dest))
    .pipe(plugins.browserSync.stream());
});



gulp.task('js', () => { // JS & BABEL & UGLIFY
  let jsSource = functions.addPath(paths.srcScript, '**/*.jsx', '_*/**/*'),
      tmpGulp = null;

  tmpGulp = gulp.src(jsSource);

  if (args.dev) {
    tmpGulp = tmpGulp.pipe(plugins.sourcemaps.init());
  }

  tmpGulp = tmpGulp.pipe(plugins.cached('js'))
    .pipe(plugins.babel())
    .on('error', handleError);

  if (args.release) {
    tmpGulp = tmpGulp.pipe(plugins.uglify());
  }

  if (args.dev) {
    tmpGulp = tmpGulp.pipe(plugins.sourcemaps.write());
  }

  tmpGulp = tmpGulp.pipe(gulp.dest(paths.destScript));

  return tmpGulp;
});



gulp.task('js-lib', () => { // JS LIB & CONCAT & UGLIFY
  let tmpGulp = null;

  tmpGulp = gulp.src(config.jsLib)
    .pipe(plugins.concat('libs.js'))
    .pipe(gulp.dest(paths.destScript));

  if (args.release) {
    tmpGulp = tmpGulp
      .pipe(plugins.uglify())
      .pipe(gulp.dest(paths.destScript));
  }

  return tmpGulp;
});



gulp.task('js-app', () => { // JS APP & CONCAT & BABEL & UGLIFY
  let concatSrc = functions.addPath(paths.srcScript + '_partial/', ['_*/**/*.jsx', '**/*.jsx']),
      tmpGulp = null;

  tmpGulp = gulp.src(concatSrc);

  if (args.dev) {
    tmpGulp = tmpGulp.pipe(plugins.sourcemaps.init());
  }

  tmpGulp = tmpGulp.pipe(plugins.concat('apps.js'))
    .pipe(plugins.babel());

  if (args.release) {
    tmpGulp = tmpGulp.pipe(gulp.dest(paths.destScript))
      .pipe(plugins.uglify());
  }

  if (args.dev) {
    tmpGulp = tmpGulp.pipe(plugins.sourcemaps.write());
  }

  tmpGulp = tmpGulp.pipe(gulp.dest(paths.destScript));

  return tmpGulp;
});



gulp.task('copy', () => { // COPY & IMAGEMIN
  let copySrc = functions.addPath(paths.srcAsset, '**/*' , '**/.gitkeep'),
      tmpGulp = null;

  tmpGulp = gulp.src(copySrc)
    .pipe(plugins.cached('copy'));

  if (args.release) {
    tmpGulp = tmpGulp.pipe(plugins.imagemin());
  }

  tmpGulp = tmpGulp.pipe(gulp.dest(paths.dest));

  return tmpGulp;
});



gulp.task('gh-pages', () => { // PUSH TO GIT
  let ghConfig = options.ghPage();

  if (args.m && args.m.trim() !== '') {
    ghConfig.message = args.m;
  }
  if (args.b && args.b.trim() !== '') {
    ghConfig.branch = args.b;
  }

  return gulp
    .src(paths.dest + '**/*')
    .pipe(plugins.ghPages(ghConfig));
});



gulp.task('sftp', () => { // SFTP
  let ftpOption = {
    host: ftp.host,
    user: ftp.username,
    pass: ftp.password,
    remotePath: ftp.base + ftp.groupFolder + '/' + ftp.projectFolder
  };

  return gulp
    .src(paths.dest + '**/*')
    .pipe(plugins.sftp(ftpOption));
});



gulp.task('check', () => { // CHECK ERROR
  let lengthErr = buildErr.length,
      countErr = `The project has ${lengthErr} error${lengthErr > 1 ? 's' : ''}`,
      str = countErr, // Improve performance
      countErrLength = str.length,
      dashChar = '==';

  while (countErrLength--) {
    dashChar+= '=';
  }

  dashChar+= '==';

  log('');
  log(dashChar);
  log('');

  log(`  ${str}  `);

  log('');
  log(dashChar);
  log('');

  if (lengthErr > 0) {
    plugins.notify.logLevel(0);
    buildErr.forEach((item, i) => {
      let message = item.message,
          code    = item.code,
          plugin  = item.plugin;
      plugins.notify.onError({
        title: plugin,
        message: message
      }).apply(this, arguments);
      log(`---[ Error ${i + 1} ]-------------------------`);
      log(`Path : ${message}`);
      code !== '' && log(`${code}`);
      log('');
    });

    log(dashChar);
    log('');
  }

  buildErr = [];
});



//________________________________________________
//                                   COMBINED TASK

gulp.task('build',
  run(
    'clean',
    ['sass', 'pug'],
    'sass-app',
    ['js', 'copy'],
    'js-lib',
    'js-app',
    'check'
  )
);

gulp.task('deploy-git', run('build', 'gh-pages'));

gulp.task('super-deploy', run('build', 'gh-pages', 'sftp'));

gulp.task('deploy', (() => {
  let deploy = args.all ? 'super-deploy' : (args.ftp ? 'deploy-ftp' : 'deploy-git');
  return run(deploy);
})());

gulp.task('default', run('build', 'serve'));

gulp.task('watch-sass', cb => run('sass', 'check')(cb));

gulp.task('watch-sass-app', cb => run('sass-app', 'check')(cb));

gulp.task('watch-pug', cb => run('pug', 'check')(cb));

gulp.task('watch-js', cb => run('js', 'check')(cb));

gulp.task('watch-js-lib', cb => run('js-lib', 'check')(cb));

gulp.task('watch-js-app', cb => run('js-app', 'check')(cb));

gulp.task('watch-copy', cb => run('copy', 'check')(cb));