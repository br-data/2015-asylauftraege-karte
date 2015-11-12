module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {

            build: {
                src: ['dist']
            }
        },

        uglify: {

            build: {

                files: {
                    
                    'dist/js/main.min.js': [
                        'dev/js/lib/d3.min.js',
                        'dev/js/lib/queue.min.js',
                        'dev/js/lib/topojson.min.js',
                        'dev/js/main.js'
                    ]
                }
            }
        },

        cssmin: {

            build: {

                src: 'dev/css/*',
                dest: 'dist/css/style.min.css'
            }
        },

        copy: {

            build: {

                files: [

                    { expand: true, flatten: true, src: ['dev/index.html'], dest: 'dist', filter: 'isFile' },
                    { expand: true, flatten: true, src: ['dev/data/*'], dest: 'dist/data', filter: 'isFile' }
                ]
            }
        },

        useminPrepare: {

            html: 'dev/index.html'
        },

        usemin: {

            html: 'dist/index.html'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');

    grunt.registerTask('build', ['clean:build', 'useminPrepare', 'uglify:build', 'cssmin:build', 'copy:build', 'usemin']);
};