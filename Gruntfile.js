module.exports = function(grunt) {

  var pkg = grunt.file.readJSON("package.json");

  grunt.initConfig({
    pkg: pkg,
    meta: {
      file: 'main',
      banner: '/* <%= pkg.name %> - <%= grunt.template.today("yyyy/mm/dd") %>\n' + '   Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> */\n'
    },

    clean: {
      "1.0": "build/1.0/",
      mark: "mark/"
    },

    babel: {
      options: pkg.babel,
      mark: {
        cwd: "src/1.0/",
        src: "**/*.js",
        dest: "mark/",
        expand: true
      }
    },

    copy: {
      "1.0": {
        files: [{
          cwd: "src/1.0/",
          src: '**/*.js',
          dest: "mark",
          expand: true
        }]
      }
    },

    uglify: {
      options: {
        compress: {
          global_defs: {
            DEBUG: false,
            DEVMODE: false,
          },
          dead_code: true,
          unused: true,
          loops: true,
          drop_console: true
        },
        mangle: false,
        // sourceMap: true,
        preserveComments: false,
        report: "min",
        beautify: {
          "ascii_only": true
        },
        ASCIIOnly: true,
        banner: "<%= meta.banner %>"
      },
      "1.0": {
        files: {
          "build/1.0/baic.min.js": ["mark/**/core.js", "mark/**/*.js", "!**/test.js"]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('1.0', [
    'clean:1.0',
    'babel:mark',
    'uglify:1.0',
    'clean:mark'
  ]);
};