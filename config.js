const port = 5000;

const pathCore = {
  src  : 'app/',
  dest : 'public/',
  bower: 'bower_components/'
}

const path = {
  src       : pathCore.src,
  srcAsset  : pathCore.src + 'assets/',
  srcStyle  : pathCore.src + 'styles/',
  srcScript : pathCore.src + 'scripts/',
  srcView   : pathCore.src + 'views/',

  dest      : pathCore.dest,
  destStyle : pathCore.dest + 'css/',
  destScript: pathCore.dest + 'js/',

  bower     : pathCore.bower
}

const jsLib = [
  path.srcScript + '_lib/modernizr-custom-3.3.1.js',
  path.bower + 'detectizr/index.js',
  path.bower + 'jquery/index.js',
  path.bower + 'react/index.js',
  path.bower + 'react-dom/index.js',
  path.srcScript + '_lib/custom.js'
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

  ghPage() {
    return {
      branch: 'gh-pages'
    }
  },

  browserSync(arg) {
    return {
      port     : port,
      ui       : { port: port + 1 },
      server   : path.dest,
      ghostMode: arg ? { clicks: true, forms: true, scroll: true }: false,
      logPrefix: 'Browsersync'
    }
  }
}


//_______________________________________
module.exports = {
  port   : port,
  paths  : path,
  jsLib  : jsLib,
  ftp    : ftp,
  options: options
}