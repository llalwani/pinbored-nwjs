
module.exports = function(grunt) {

  // requirements
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    

    // copy only neccesary files from bower modules
    bowercopy: {
      options: {
        // Task-specific options go here
        srcPrefix : 'App/bower_components',
        destPrefix : 'App/bower_components_dist',
        runBower : true,
        clean : false,
        report : true
      },
      bowercomponents: {
        // Target-specific file lists and/or options go here
        files: {
          // Keys are destinations (prefixed with `options.destPrefix`)
          // Values are sources (prefixed with `options.srcPrefix`); One source per destination
          // e.g. 'bower_components/chai/lib/chai.js' will be copied to 'bower_components_dist/libs/chai.js'
          // 'libs/chai.js': 'chai/lib/chai.js'

          // FONTS
          'flat-ui/dist/fonts/lato/lato-regular.woff': 'flat-ui/dist/fonts/lato/lato-regular.woff',
          'flat-ui/dist/fonts/lato/lato-light.woff': 'flat-ui/dist/fonts/lato/lato-light.woff',
          'flat-ui/dist/fonts/lato/lato-bold.woff': 'flat-ui/dist/fonts/lato/lato-bold.woff',
          'flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.woff': 'flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.woff',
          'bootstrap/dist/fonts/glyphicons-halflings-regular.woff': 'bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
          'bootstrap/dist/fonts/glyphicons-halflings-regular.woff2': 'bootstrap/dist/fonts/glyphicons-halflings-regular.woff2',

          // CSS
          'bootstrap/dist/css/bootstrap.css': 'bootstrap/dist/css/bootstrap.css',
          'animate.css/animate.min.css': 'animate.css/animate.min.css',
          'ng-tags-input/ng-tags-input.min.css': 'ng-tags-input/ng-tags-input.min.css',
          'flat-ui/dist/css/flat-ui.css': 'flat-ui/dist/css/flat-ui.css',
          'angular-gridster/dist/angular-gridster.min.css': 'angular-gridster/dist/angular-gridster.min.css',

          // JS
          'jquery/dist/jquery.js': 'jquery/dist/jquery.js',
          'angular/angular.js': 'angular/angular.js',
          'bootstrap/dist/js/bootstrap.js': 'bootstrap/dist/js/bootstrap.js',
          // 'json3/lib/json3.min.js': 'json3/lib/json3.min.js',
          'underscore/underscore.js' : 'underscore/underscore.js',

          'angular-bootstrap/ui-bootstrap.js': 'angular-bootstrap/ui-bootstrap.js',
          'angular-resource/angular-resource.js': 'angular-resource/angular-resource.js',
          'angular-route/angular-route.js': 'angular-route/angular-route.js',
          'angular-sanitize/angular-sanitize.js': 'angular-sanitize/angular-sanitize.js',
          'angular-animate/angular-animate.js': 'angular-animate/angular-animate.js',
          'angular-mocks/angular-mocks.js': 'angular-mocks/angular-mocks.js',

          'angular-gridster/src/angular-gridster.js': 'angular-gridster/src/angular-gridster.js',

          // 'ng-tags-input/ng-tags-input.js': 'ng-tags-input/ng-tags-input.js',
          'ng-tags-input/ng-tags-input.min.js': 'ng-tags-input/ng-tags-input.min.js',
          
          'flat-ui/dist/js/flat-ui.js': 'flat-ui/dist/js/flat-ui.js',

          'fui-angular/fui-template.js': 'fui-angular/fui-template.js',
          'fui-angular/fui-checkbox.js': 'fui-angular/fui-checkbox.js',
          'fui-angular/fui-radio.js': 'fui-angular/fui-radio.js',
          'fui-angular/fui-switch.js': 'fui-angular/fui-switch.js',
          'fui-angular/fui-tpls.js': 'fui-angular/fui-tpls.js'
        }
      }
    },

    // building native binaries
    nodewebkit: {
      
      buildOsx : {
        options: {
          platforms: ['osx32', 'osx64'],
          buildType: 'versioned', // [appName] -v[appVersion]
          macCredits: './Resources/pinbored-credits.html',
          macIcns: './Resources/pinbored-icon.icns',
          // macZip: 'false', // set to false (speedup) by default
          buildDir: './Build', // Where the build version of my node-webkit app is saved
        },
        src: ['./App/**/*'] // Your node-webkit app
      },

      buildWin : {
        options: {
          platforms: ['win32', 'win64'],
          buildType: 'versioned', // [appName] -v[appVersion]
          // winIco: 'null',
          buildDir: './Build', // Where the build version of my node-webkit app is saved
        },
        src: ['./App/**/*'] // Your node-webkit app
      },

      buildLin : {
        options: {
          platforms: ['linux32', 'linux64'],
          buildType: 'versioned', // [appName] -v[appVersion]
          buildDir: './Build', // Where the build version of my node-webkit app is saved
        },
        src: ['./App/**/*'] // Your node-webkit app
      }

    },
  
    // karma settings, conf.js file
    karma : {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    // open karma testing report
    open : {
      report : {
        path : 'karma.report.html',
        app: 'Google Chrome'
      }
    },

    // codeclimate coverage lcov.info
    shell: {
      codeclimate: {
        multiple: {
          command: [
            'export CODECLIMATE_REPO_TOKEN=10daff674413d0c7f0a4a4c177db01e8215217c74c23ec408dc4325e7ece27ca',
            'codeclimate < coverage/lcov.info'
          ].join('&&')
        }
      }
    }
    
  });

  // Load the plugin that provides the "nodewebkit" task.
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-open');
  // grunt.loadNpmTasks('grunt-traceur');

  // updating task(s)
  grunt.registerTask('update', ['bowercopy']);

  // testing task(s)
  // grunt.registerTask('test', ['karma', 'open:report']);
  grunt.registerTask('test', 'runs testing, shows report, generates coverage', function () {
    var tasks = ['karma', 'open:report', 'shell:codeclimate'];
    // Use the force option for all tasks declared in the previous line
    grunt.option('force', true);
    grunt.task.run(tasks);
  });

  // building task(s)
  grunt.registerTask('build', ['nodewebkit:buildOsx', 'nodewebkit:buildWin', 'nodewebkit:buildLin']);

  grunt.registerTask('osx', ['nodewebkit:buildOsx']);
  grunt.registerTask('win', ['nodewebkit:buildWin']);
  grunt.registerTask('lin', ['nodewebkit:buildLin']);

  grunt.registerTask('default', ['test', 'osx']);

};