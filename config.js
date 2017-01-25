const portWeb = 5000;
const portServer = portWeb - 1;

const pathCore = {
  src  : 'app/',
  dest : 'public/',
  bower: 'bower_components/'
};

const paths = {
  src       : pathCore.src,
  srcAsset  : pathCore.src + 'assets/',
  srcStyle  : pathCore.src + 'styles/',
  srcScript : pathCore.src + 'scripts/',
  srcView   : pathCore.src + 'views/',

  dest      : pathCore.dest,
  destStyle : pathCore.dest + 'css/',
  destScript: pathCore.dest + 'js/',

  bower     : pathCore.bower
};

const jsLib = [
  paths.srcScript + '_lib/modernizr-custom-3.3.1.js',
  paths.bower + 'detectizr/index.js',
  paths.bower + 'jquery/index.js',
  paths.bower + 'react/index.js',
  paths.bower + 'react-dom/index.js',
  paths.srcScript + '_lib/custom.js'
];

const ftp = {
  host         : '',
  username     : '',
  password     : '',
  base         : '',
  groupFolder  : '',
  projectFolder: ''
};

const options = {
  pug(arg) {
    return {
      pretty: !arg
    }
  },

  sass(arg) {
    return {
      outputStyle: arg ? 'compressed' : 'expanded'
    }
  },

  autoprefixer() {
    return {
      browsers: ['last 5 versions']
    }
  },

  eslint() {
    return {
      parserOptions: {
        ecmaFeatures: {
          'impliedStrict': true,
          'jsx': true
        }
      },
      rules: {
        // Error
        'no-cond-assign': ['error', 'always'],
        'no-dupe-args': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-obj-calls': 'error',
        'no-unexpected-multiline': 'error',
        'block-scoped-var': 'error',
        'curly': 'error',
        'eqeqeq': ['error', 'always'],
        'no-multi-str': 'error',
        'no-redeclare': ['error', { 'builtinGlobals': true }],
        'no-self-assign': 'error',
        'no-self-compare': 'error',
        'no-delete-var': 'error',
        'no-label-var': 'error',
        'no-undef': 'error',
        // Warning
        'no-constant-condition': ['warn', { 'checkLoops': false }],
        'no-empty': 'warn',
        'no-extra-semi': 'warn',
        'no-empty-function': 'warn',
        'no-return-assign': ['warn', 'always'],
        'no-useless-concat': 'warn',
        'no-useless-escape': 'warn',
        'no-unused-vars': 'warn',
        'quotes': ['warn', 'single', { 'allowTemplateLiterals': true }]
      },
      envs: ['browser', 'es6']
    }
  },

  ghPage() {
    return {
      branch: 'gh-pages'
    }
  },

  browserSync(arg) {
    return {
      port     : portWeb,
      proxy    : 'http://localhost:' + portServer,
      ui       : { port: portWeb + 1 },
      file     : [paths.dest + '/**/*.*'],
      ghostMode: arg ? { clicks: true, forms: true, scroll: true }: false,
      logPrefix: 'Browsersync'
    }
  },

  nodemon() {
    return {
      script: 'server.js',
      ignore: [
        'gulpfile.js',
        'node_modules/',
        'public/',
        'app/'
      ]
    }
  }
};

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
};

const dir = {
  pug: functions.addPath(paths.srcView, '**/*.pug', '_*/**/*'),

  sass: functions.addPath(paths.srcStyle, '**/*.scss', '_*/**/*'),
  sassApp: functions.addPath(paths.srcStyle, '_partial/**/*.scss'),

  js: functions.addPath(paths.srcScript, '**/*.jsx', '_*/**/*'),
  jsApp: functions.addPath(paths.srcScript + '_partial/', ['_*/**/*.jsx', '**/*.jsx']),

  copy: functions.addPath(paths.srcAsset, '**/*' , '**/.gitkeep')
};


//_______________________________________
module.exports = {
  ftp       : ftp,
  functions : functions,
  jsLib     : jsLib,
  options   : options,
  paths     : paths,
  dir       : dir,
  portWeb   : portWeb,
  portServer: portServer
};
