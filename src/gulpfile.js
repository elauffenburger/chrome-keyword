var gulp = require('gulp'),
	watch = require('gulp-watch'),
	concat = require('gulp-concat'),
	print = require('gulp-print'),
	dest = require('gulp-dest'),
	sourcemaps = require('gulp-sourcemaps'),
	template = require('gulp-template'),
	globAll = require('glob-all'),
	gulpFilter = require('gulp-filter'),
	minifyCss = require('gulp-minify-css');

var paths = {
	libs: [
		'./libs/jquery.js',
		'./libs/lodash.min.js',
		'./libs/bootstrap.min.js',
		'./libs/angular.min.js',
		'./libs/angular-route.min.js',
		'./libs/angular-ui-router.min.js'
	],
	modules: [
		'./manage_src/services/urlHelper.js',
		'./manage_src/services/routeHelper.js',
		'./manage_src/services/keywordHelper.js',
		'./manage_src/app.js',
		'./manage_src/controllers/manage.controller.js',
	],
	static_content: ["./scripts/**/*.js", "./html/**/*.html"],
	static_libs: './static_libs/**/*',
	manage: {
		all: "./manage_src/**/*",
		scripts: ["./manage_src/**/*.js"],
		html: "./manage_src/*.html",
		style: [
			'./manage_src/style/bootstrap.min.css',
			'./manage_src/style/bootstrap-theme.min.css',
			'./manage_src/style/manage.css'
		],
		views: "./manage_src/views/*.html",
		buildIgnorePath: "/manage_src"
	},
	build : {
		manage: {
			scripts: "../build/manage/",
			libs: "../build/manage/scripts/",
			base: "../build/manage/",
			views: "../build/manage/views/",
			clientRelativeBase: "scripts/",
			style: "../build/manage/style/"
		},
		static_content: {
			scripts: '../build/scripts/',
			html: '../build/html/',
			libs: '../build/libs/'
		}
	}
};

gulp.task('manage', taskManage);
gulp.task('copy_manage_libs', copyManageLibs);
gulp.task('copy_static_content', copyStaticContent);

gulp.task('watch', ['copy_manage_libs', 'copy_static_content', 'manage'], function() {
	watch(paths.manage.all, function() {
		taskManage();
	});
});

function deGlobPaths(obj, keepFolder, basePath) {
	
	function secondToLast(aFileName, character) {
		var previousIndex = -1,
			currentIndex = -1;
		
		for(var i in aFileName) {
			var c = aFileName[i];
			if(c == character) {
				previousIndex = currentIndex;
				currentIndex = i;
			}
		}
		
		return previousIndex;
	}
	
	basePath = basePath || "";
	
	var copy = [].concat(obj);
	var files = globAll.sync(copy);
	
	var fileNames = [];
	
	for(var i in files) {
		var file = files[i];
		
		var folderSlash = keepFolder ? secondToLast(file, '/') : file.lastIndexOf('/');
		var fileName = file.substr(folderSlash).replace(paths.manage.buildIgnorePath, '').substr(1);
		
		fileNames.push(basePath + fileName);
	}
	
	return fileNames;
}

function taskManage() {
	var libs = deGlobPaths(paths.libs, false, 'scripts/'),
		modules = deGlobPaths(paths.modules, true, '');
	
	console.log('modules: ', modules);
	
	gulp.src(paths.manage.html)
		.pipe(template(
			{
				libs: libs,
				modules: modules
			}))
		.pipe(gulp.dest(paths.build.manage.base));
	
	gulp.src(paths.manage.style)
		.pipe(concat('all.min.css'))
		.pipe(minifyCss())
		.pipe(gulp.dest(paths.build.manage.style));

	gulp.src(paths.manage.scripts)
		.pipe(gulp.dest(paths.build.manage.scripts));
	
	gulp.src(paths.manage.views)
		.pipe(gulp.dest(paths.build.manage.views));
};

function copyManageLibs() {
	gulp.src(paths.libs)
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.build.manage.libs));
}

function copyStaticContent() {
	var jsFilter = gulpFilter('**/*.js'),
		htmlFilter = gulpFilter('**/*.html');
	
	gulp.src(paths.static_content)
		.pipe(jsFilter)
			.pipe(gulp.dest(paths.build.static_content.scripts))
			.pipe(jsFilter.restore())
		.pipe(htmlFilter)
			.pipe(gulp.dest(paths.build.static_content.html))
			.pipe(htmlFilter.restore());
	
	gulp.src(paths.static_libs)
		.pipe(gulp.dest(paths.build.static_content.libs));
	
	gulp.src('./manifest.json')
		.pipe(gulp.dest('../build/'));
}