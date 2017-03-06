module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {

      dist: {
        src: ['dist']
      }
    },

    uglify: {

      dist: {

        files: {

          'dist/js/main.min.js': [
            'src/js/main.js'
          ]
        }
      }
    },

    concat: {

      build: {

        options: {

          separator: '\n'
        },

        src: [
          'node_modules/d3/d3.min.js',
          'node_modules/d3-queue/build/d3-queue.min.js',
          'node_modules/topojson/dist/topojson.min.js'
        ],

        dest: 'dist/js/main.min.js'
      }
    },

    cssmin: {

      dist: {

        src: 'src/css/style.css',
        dest: 'dist/css/style.min.css'
      }
    },

    copy: {

      dist: {

        files: [

          { expand: true, flatten: true, src: ['src/index.html'], dest: 'dist', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/preview.jpg'], dest: 'dist', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/css/brdata.png'], dest: 'dist/css', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/data/*'], dest: 'dist/data', filter: 'isFile' }
        ]
      }
    },

    useminPrepare: {

      html: 'src/index.html'
    },

    usemin: {

      html: 'dist/index.html'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('dist', ['clean', 'useminPrepare', 'uglify', 'concat', 'cssmin', 'copy', 'usemin']);
};
