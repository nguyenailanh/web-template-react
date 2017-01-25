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
const dir = config.dir;
const options = config.options;
const ftp = config.ftp;
const run = plugins.sequence.use(gulp);
const args = plugins.yargs.argv;
const functions = config.functions;
const log = console.log;



//________________________________________________
//                                        VARIABLE
let buildErr = {
      data: [],
      errorCount: 0,
      warningCount: 0
    },
    isStream = false,
    isJSValid = true,
    isJSAppValid = true;



//________________________________________________
//                                    HANDLE EVENT
const handleError = function handleError(err) {
  let errObj = {
    type: 'Error',
    plugin: err.plugin.toUpperCase(),
    message: err.message.trim(),
    code: err.codeFrame || ''
  };

  buildErr.data.push(errObj);
  buildErr.errorCount+= 1;
  typeof this.emit === 'function' && this.emit('end');
};

const handleESLintError = function handleESLintError(results) {
  if (results.errorCount === 0 && results.warningCount === 0) { return true; }

  results.forEach(result => {
    let path = result.filePath;

    result.messages.forEach(error => {
      let isError = error.severity === 2,
          type = isError ? 'Error' : 'Warning';

      buildErr.data.push({
        type: type,
        plugin: `ES Lint ${type}`,
        message: path,
        code: `[${error.line}:${error.column}]  ${error.source.trim()}\n |  ${error.message}`
      });

      buildErr[isError ? 'errorCount' : 'warningCount']+= 1;
    });
  });

  return results.errorCount === 0;
};

const clearCache = function clearCache(name) {
  typeof name === 'undefined'
    ? plugins.cached.caches = {}
    : delete plugins.cached.caches[name];
};



//________________________________________________
//                                           TASKS
gulp.task('clean', () => { // CLEAN
  clearCache();
  return plugins.del(paths.dest);
});



gulp.task('check', () => { // CHECK ERROR
  let baseString = 'The project has',
      errorLength = buildErr.errorCount,
      errorString = `${errorLength} error${errorLength > 1 ? 's' : ''}`,
      warningLength = buildErr.warningCount,
      warningString = `${warningLength} warning${warningLength > 1 ? 's' : ''}`,
      resultString = `${baseString} ${errorString} & ${warningString}`,
      resultStr = resultString, // Improve perf
      countStringLength = resultStr.length,
      totalResult = errorLength + warningLength,
      dashChar = '==';

  while (countStringLength--) {
    dashChar+= '=';
  }

  dashChar+= '==';

  log('');
  log(dashChar);
  log('');

  log(`  ${resultStr}  `);

  log('');
  log(dashChar);
  log('');

  if (!totalResult) return;

  plugins.notify.logLevel(0);
  buildErr.data.forEach((item, i) => {
    let message = item.message,
        code    = item.code,
        plugin  = item.plugin,
        type    = item.type || 'Error';

    plugins.notify.onError({
      title: plugin,
      message: message
    }).apply(this, arguments);
    log(`---[ ${type} ${i + 1} ]-------------------------`);
    log(` |  Path : ${message}`);
    code !== '' && log(` |  ${code}`);
    log('');
  });

  log(dashChar);
  log('');

  buildErr.data = [];
  buildErr.errorCount = 0;
  buildErr.warningCount = 0;
});



gulp.task('nodemon', callback => { // NODEMON
  let started = false;

  plugins.nodemon(options.nodemon())
    .on('start', () => {
      if (!started) {
        callback();
        started = true;
      }
    });
});



gulp.task('server', ['nodemon'], () => { // BROWSER SYNC & NODEMON
  isStream = true;
  plugins.browserSync.init(options.browserSync(args.sync));

  //----- HTML --------------------
  gulp.watch(dir.pug, ['watch-pug']);
  gulp.watch(paths.srcView + '_*/**/*.pug', ['watch-pug'])
    .on('change', () => clearCache('pug'));

  //----- CSS --------------------
  gulp.watch(dir.sass, ['watch-sass']);
  gulp.watch(paths.srcStyle + '_partial/**/*.scss', ['watch-sass-app']);
  gulp.watch(paths.srcStyle + '_cores/**/*.scss', ['watch-sass-all'])
    .on('change', () => clearCache('sass'));

  //----- JS --------------------
  gulp.watch(dir.js, ['watch-js'])
    .on('change', plugins.browserSync.reload);
  gulp.watch(paths.srcScript + '_lib/**/*.js', ['watch-js-lib'])
    .on('change', plugins.browserSync.reload);
  gulp.watch(paths.srcScript + '_partial/**/*.jsx', ['watch-js-app'])
    .on('change', plugins.browserSync.reload);

  //----- ASSETS --------------------
  gulp.watch(paths.srcAsset + '**/*', ['watch-copy'])
    .on('change', plugins.browserSync.reload);
});



gulp.task('pug', () => {
  return (
    gulp
      .src(dir.pug)
      .pipe(plugins.cached('pug'))
      .pipe(plugins.pug(options.pug(args.release)))
      .on('error', handleError)
      .pipe(gulp.dest(paths.dest))
      .pipe(plugins.browserSync.stream())
  );
});



gulp.task('sass',  () => { // SASS & AUTO PREFIXER
  return (
    gulp
      .src(dir.sass)
      .pipe(plugins.cached('sass'))
      .pipe(plugins.sass(options.sass(args.release)))
      .on('error', handleError)
      .pipe(plugins.autoprefixer(options.autoprefixer()))
      .on('error', handleError)
      .pipe(gulp.dest(paths.destStyle))
      .pipe(plugins.browserSync.stream())
  );
});



gulp.task('sass-app', () => { // SASS APP FOLDER & CONCAT & AUTO PREFIXER
  return (
    gulp
      .src(dir.sassApp)
      .pipe(plugins.sass(options.sass(args.release)))
      .on('error', handleError)
      .pipe(plugins.autoprefixer(options.autoprefixer()))
      .on('error', handleError)
      .pipe(plugins.concat('apps.css'))
      .pipe(gulp.dest(paths.destStyle))
      .pipe(plugins.browserSync.stream())
  );
});



gulp.task('js-lint', () => {
  let tmpGulp = null;

  tmpGulp = gulp.src(dir.js)
    .pipe(plugins.eslint(options.eslint()))
    .pipe(plugins.eslint.results(results => {
      isJSValid = handleESLintError(results);
    }));

  if (isStream) { return tmpGulp; }

  tmpGulp = tmpGulp
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failOnError());

  return tmpGulp;
});



gulp.task('js', () => { // JS & BABEL & UGLIFY
  let tmpGulp = null;

  if (!isJSValid) { return; }

  tmpGulp = gulp.src(dir.js)

  if (args.dev) {
    tmpGulp = tmpGulp.pipe(plugins.sourcemaps.init());
  }

  tmpGulp = tmpGulp
    .pipe(plugins.cached('js'))
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



gulp.task('js-app-lint', () => {
  let tmpGulp = null;

  tmpGulp = gulp.src(dir.jsApp)
    .pipe(plugins.eslint(options.eslint()))
    .pipe(plugins.eslint.results(results => {
      isJSAppValid = handleESLintError(results);
    }));

  if (isStream) { return tmpGulp; }

  tmpGulp = tmpGulp
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failOnError());

  return tmpGulp;
});



gulp.task('js-app', () => { // JS APP & CONCAT & BABEL & UGLIFY
  let tmpGulp = null;

  if (!isJSAppValid) { return; }

  tmpGulp = gulp.src(dir.jsApp);

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
  let tmpGulp = null;

  tmpGulp = gulp.src(dir.copy)
    .pipe(plugins.changed(paths.dest));

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

  return (
    gulp
      .src(paths.dest + '**/*')
      .pipe(plugins.ghPages(ghConfig))
  );
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



//________________________________________________
//                                   COMBINED TASK
gulp.task('build',
  run(
    'clean',
    ['sass', 'pug'],
    'sass-app',
    'js-lint',
    'js',
    'js-lib',
    'js-app-lint',
    'js-app',
    'copy',
    'check'
  )
);

gulp.task('default', run('build', 'server'));

gulp.task('deploy-git', run('build', 'gh-pages'));
gulp.task('super-deploy', run('build', 'gh-pages', 'sftp'));
gulp.task('deploy', (() => {
  let deploy = args.all ? 'super-deploy' : (args.ftp ? 'deploy-ftp' : 'deploy-git');
  return run(deploy);
})());

gulp.task('watch-pug', cb => run('pug', 'check')(cb));

gulp.task('watch-sass', cb => run('sass', 'check')(cb));
gulp.task('watch-sass-app', cb => run('sass-app', 'check')(cb));
gulp.task('watch-sass-all', cb => run('sass', 'sass-app', 'check')(cb));

gulp.task('watch-js', cb => run('js-lint', 'js', 'check')(cb));
gulp.task('watch-js-lib', cb => run('js-lib', 'check')(cb));
gulp.task('watch-js-app', cb => run('js-app-lint', 'js-app', 'check')(cb));

gulp.task('watch-copy', cb => run('copy', 'check')(cb));
