module.exports = function(grunt) {
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: "/* jsaprs */\n"
      },
      build: {
        src: 'jsaprs.js',
        dest: 'build/jsaprs.min.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default',['uglify']);
}
