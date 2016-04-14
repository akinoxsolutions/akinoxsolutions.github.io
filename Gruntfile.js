module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            minified: {
                options: {
                    compress: true,
                    cleancss: true,
                    yuicompress: false,
                    optimization: 2
                },
                files: [
                    {
                        src: ["less/geeks-akinox-com.less", "less/syntax.less"],
                        dest: "css/all.min.css"
                    }
                ]
            }
        },
        watch: {
            less: {
                files: ['less/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false,
                }
            },
        },
    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['less']);

};
