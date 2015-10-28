var gulp = require('gulp');
var path = require('path');
var devGulpTasks = require('grommet/utils/gulp/gulp-tasks');

var opts = {
  copyAssets: [
    'src/index.html',
    {
      asset: 'src/img/**',
      dist: 'dist/img/'
    }
  ],
  jsAssets: ['src/js/**/*.js'],
  mainJs: 'src/js/index.js',
  mainScss: 'src/scss/index.scss',
  devServerPort: 9000,
  scsslint: true,
  sync: {
    hostname: 'meadadvocate.org',
    username: 'root',
    remoteDestination: '/var/www/tools/yan-calculator-tools'
  }
};

devGulpTasks(gulp, opts);
