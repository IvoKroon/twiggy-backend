/**
 * Created by ivokroon on 17/11/2016.
 */
var gulp = require('gulp'),
    nodemon = require("gulp-nodemon");

gulp.task('default', function(){
    nodemon({
        script: 'index.js',
        ext: 'js',
        env:{
            PORT:4000
        },
        ignore: ['./node_modules/**']
    })
    .on('restart', function(){
        console.log("Restarting");
    })
});