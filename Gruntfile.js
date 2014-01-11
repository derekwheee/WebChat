module.exports = function(grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                options : {
                    style  : 'compressed',
                    banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> / (C)<%= grunt.template.today("yyyy") %> <%= pkg.author %> */'
                },
                files: {
                    'css/main.css' : 'css/main.scss'
                }
            }
        },
        watch: {
            css: {
                files: '**/*.scss',
                tasks: ['sass']
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['sass', 'watch']);

};