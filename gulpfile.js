// 1. Generate CSS
// 2. Generate JS
// 3. Create Service Worker

var gulp = require("gulp"),
    include = require("gulp-include"),
    svgmin = require("gulp-svgmin"),
    sass = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    watch = require("gulp-watch"),
    colors = require("colors"),
    notifier = require("node-notifier"),
    sassglob = require("gulp-sass-glob"),
    browserify = require('browserify'),
    swPrecache = require('sw-precache'),
    fs = require('fs'),
    path = require('path');

var srcdirs = {
  css: "src/css",
  js: "src/js",
  svg: "src/svg"
}
var distdirs = {
  css: "dist/css",
  js: "dist/js",
  svg: "dist/svg"
}
var maincss = srcdirs.css + "/styles.scss";
var mainjs = srcdirs.js + "/app.js";

function notifyError(error) {
  console.log(" - There was an error compiling:".red);
  console.log(error.messageFormatted);

  var weHaveAProblem = [
    "Something went terribly wrong.",
    "Something broke, big time.",
    "You killed it, you bastard, you actually killed it.",
    "Everytime the code breaks, a kitten loses its wings."
  ];

  notifier.notify({
    title: "[GULP] We have a problem",
    icon: "https://lh3.googleusercontent.com/E6EO3XO6zP7NtBq2L9SDF1DbBoYamUWc8QTRvOFuQg_Gka2Vw_RIv-AjU5Ysu4XgwHU=w170",
    message: weHaveAProblem[Math.floor(Math.random() * weHaveAProblem.length)] + " Check the console please."
  })
}

gulp.task("build-svg", function() {
  console.log(" -- Compiling ".green + "svg ".yellow + new Date());
  gulp.src(srcdirs.svg + "/**/*.svg")
    .pipe(svgmin())
      .on("error", notifyError)
    .pipe(gulp.dest(distdirs.svg));
})

gulp.task("build-js", function() {
  console.log(" -- Compiling ".green + "js ".cyan + new Date());
  browserify(mainjs)
    .transform("babelify", {presets: ["es2015", "react"]})
      .on("error", notifyError)
    .bundle()
      .on("error", notifyError)
    .pipe(fs.createWriteStream(distdirs.js+"/app.js"));
});

gulp.task("build-css", function() {
  console.log(" -- Compiling ".green + "css ".magenta + new Date())
  gulp.src(maincss)
    .pipe(sassglob())
      .on("error", notifyError)
    .pipe(sass())
      .on("error", notifyError)
    .pipe(autoprefixer())
      .on("error", notifyError)
    .pipe(gulp.dest(distdirs.css));
});

gulp.task("watch-svg", function() {
  return watch(srcdirs.svg + "/**/*.svg", function() {
    gulp.start("build-svg");
  });
})

gulp.task("watch-js", function() {
  return watch(srcdirs.js + "/**/*.js", function() {
    gulp.start("build-js");
  });
})

gulp.task("watch-css", function() {
  return watch(srcdirs.css + "/**/*.scss", function() {
    gulp.start("build-css")
  });
})

gulp.task('generate-service-worker', function(callback) {
  var rootDir = 'dist';
  swPrecache.write('service-worker.js', {
    staticFileGlobs: ['dist/**/*.{js,html,css,png,jpg,gif}']
  }, callback);
});


gulp.task("build", ["build-js", "build-css", "build-svg", "generate-service-worker"]);
gulp.task("watch", ["build", "watch-js", "watch-css", "watch-svg"]);
gulp.task("default", ["build"]);

console.log("- Starting Gulp".rainbow);
