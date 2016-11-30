const gulp			= require("gulp")
const bump			= require("gulp-bump")
const clean			= require("gulp-clean")
const replace		= require("gulp-replace")
const jeditor		= require("gulp-json-editor")
const zip			= require('gulp-zip')
const runSequence	= require('run-sequence')

/**
 * This configuration contains exported
 * constants
 *
 * appID      - Mozilla Firefox Add-on/Web Extension ID
 * issuer     - JWT Issuer
 * secret     - JWT Secret
 * updateURL  - Auto Update URL
 * betaDeploy - Destination to copy the beta zip archive
 */
const config = require("./config/config.js");

/**
 * Copies vender files to the src/vendors directory.
 */
gulp.task('default', () => {

    // copy bootstrap files
    gulp.src([
		'node_modules/bootstrap/dist/**'
	]).pipe(gulp.dest('src/options/vendor/bootstrap'))
	
	// copy jquery
	gulp.src([
		'node_modules/jquery/dist/jquery.min.js'
	])
	.pipe(gulp.dest('src/options/vendor'))
	.pipe(gulp.dest('src/content'))

    // copy jquery-ui
	gulp.src([
		'node_modules/jquery-ui-dist/jquery-ui.min.js',
		'node_modules/jquery-ui-dist/jquery-ui.min.css'		
	])
	.pipe(gulp.dest('src/options/vendor/jquery-ui/'))
	
	gulp.src([
		'node_modules/jquery-ui-dist/images/**'
	])
	.pipe(gulp.dest('src/options/vendor/jquery-ui/images'))
	
    return gulp.src([
		'node_modules/vue/dist/vue.js',
		'node_modules/vue/dist/vue.runtime.min.js',
		'node_modules/vue-router/dist/vue-router.min.js',
		'node_modules/sortablejs/Sortable.min.js',
		'node_modules/vuedraggable/dist/vuedraggable.js',
		'node_modules/bowser/bowser.min.js'
	])
	.pipe(gulp.dest('src/options/vendor'))
	.on('finish', () => {
		console.log('Imported vendor files.')
	});
	
});

gulp.task('clean', () => {
	
	return gulp.src([
		'dist',
		'src/options/vendor',
		'src/content/jquery.min.js'
	], {read: false})
	.pipe(clean())
	
});

gulp.task('bump-major', () => {
	
	gulp.src('package.json').pipe(bump({type:'major'})).pipe(gulp.dest(''));
	return gulp.src('src/manifest.json').pipe(bump({type:'major'})).pipe(gulp.dest('src'));
	
});

gulp.task('bump-minor', () => {
	
	gulp.src('package.json').pipe(bump({type:'minor'})).pipe(gulp.dest(''));
	return gulp.src('src/manifest.json').pipe(bump({type:'minor'})).pipe(gulp.dest('src'));
	
});

gulp.task('bump', () => {
	
	gulp.src('package.json').pipe(bump()).pipe(gulp.dest(''));
	return gulp.src('src/manifest.json').pipe(bump()).pipe(gulp.dest('src'));
	
});

gulp.task('build', () => {
	
	runSequence('clean', 'bump', 'default', () => {
			
		// copy extension files
		gulp.src([
			'src/**',
			'!src/manifest.json',
			'!src/firefox-build.cmd',
			'!src/options/js/components/**',
			'!src/options/js/components'
		])
		.pipe(gulp.dest('dist/chrome'))
		.pipe(gulp.dest('dist/firefox'))
		.on('finish', () => {
			
			// chrome manifest
			gulp.src([
				'src/manifest.json'
			])
			.pipe(gulp.dest("dist/chrome"))
			.on('finish', () => {
		
				setTimeout(() => {
					var date = new Date();
					var version = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+'.'+date.getMinutes()+'.'+date.getSeconds()
					
					gulp.src([
						"dist/chrome/**"
					])
					.pipe(zip('mfc-assistant-chrome.'+version+'.zip'))
					.pipe(gulp.dest('dist'))
					.on('finish', () => {

						setTimeout(() => {

							if(config.betaDeploy != undefined) {
							
								gulp.src([
									"dist/mfc-assistant-chrome.*.zip"
								])
								.pipe(gulp.dest(config.betaDeploy))
								
							}
							
							console.log('Finished Chrome.')
							
						}, 1000)
						
					})
				}, 1000);
				
			});
			
			// firefox manifest
			gulp.src([
				'src/manifest.json'
			])
			.pipe(jeditor(function(json){
				
				if(config.appID && config.updateURL) {
					json.applications = {
						gecko: {
							id: config.appID,
							strict_min_version: '42.0',
							strict_max_version: '50.*',
							update_url: config.updateURL
						}
					};
				}
				
				return json;
			}))
			.pipe(gulp.dest("dist/firefox"))
			.on('finish', () => {
				setTimeout(() => {
					if(config.issuer && config.secret) {
						gulp.src('src/firefox-build.cmd')
							.pipe(replace('JWT_ISSUER', config.issuer))
							.pipe(replace('JWT_SECRET', config.secret))
							.pipe(gulp.dest('dist/firefox'))
							.on('finish', () => {
								console.log('Finished Firefox.');
							});
					}
				}, 1000);
			})
			
		})
		
	});
		
});

