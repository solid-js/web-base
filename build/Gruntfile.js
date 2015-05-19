/**
 *
 * JS
 * - js/static-libs.js (contient require / jquery / handlebars / solid etc ...)
 * - js/components.js (contient tous les composants solid réutilisables)
 * - js/{appName}-app.js (contient les scripts de l'app)
 *
 * CSS
 * - css/static-libs.css (knacss etc)
 * - css/components.css (styles intégrés au composants)
 * - css/{appName}-app.css (les styles de l'app)
 */

/**
 * FAIRE PASSER LA COMPILATION TYPESCRIPT 1.5 AVEC GRUNT-TS ou GRUNT-TYPESCRIPT
 *
 * Aller dans le dossier du module node grunt-ts par exemple
 * Supprimer node_modules/typescript
 * npm install typescript@1.5.0beta pour forcer la version
 *
 * HOP
 */

/**
 * Si jamais grunt ressort une erreur du type
 * define is not defined
 * Réinstaller le module en question ...
 * https://github.com/TypeStrong/grunt-ts/issues/105
 */

module.exports = function (grunt)
{
    var staticConfig = {
        // tsssst, you don't need to touch it !
        projectWorkingDirectory: '../',
        tempDir: 'temp/',
        typescriptMainFile: 'Main',

        // Include references for typescript (use TSD to manage them)
        typescriptReferences: [
            'typings/**/*.d.ts'
        ]
    };

	// Autoload grunt tasks
	require('load-grunt-tasks')(grunt);

    // Populate grunt config dynamically
    require('./solid/dynamic-grunt').populateGruntConfig(grunt, staticConfig,

        // --------------------------------------------------------------------- BUNDLES CONFIG
		[
			// Package static JS libraries in one file
			{
                type: 'js',
				name: 'static-js',
				dest: 'deploy/js/static-libs.js',
				src: [
                    // AMD modules management with async define and requirejs statements
                    'lib/requirejs/require.js',

                    // define.amd is disabled so helpers libs like jQuery and handlebars are available in window, no need to require them
                    'build/solid/require-disable-AMD.js',

					// JQUERY on window
					'lib/jquery/dist/jquery.min.js',

					// HANDLEBARS TEMPLATING on window
					'lib/handlebars/handlebars.js',

					// Q on window
					'lib/q/q.js',

					// GSAP on window
					'lib/gsap/src/minified/TweenLite.min.js',
					'lib/gsap/src/minified/TimelineLite.min.js',
					'lib/gsap/src/minified/jquery.gsap.min.js',
					'lib/gsap/src/minified/easing/*.js',
					'lib/gsap/src/minified/plugins/*.js',

					// SOLID JS framework
					'lib/solid-js/**/*.ts'
				]
			},

			// Package static CSS libraries
			{
                type: 'css',
				name: 'static-css',
				dest: 'deploy/css/static-libs.css',
				src: [
					'lib/knacss/less/knacss.less'
				]
			},

            // Package components
            {
                type: 'app',
                name: 'components',
                js: 'deploy/js/components.js',
                css: 'deploy/css/components.css',
                app: 'src/components/',
                include: [
                    '**/'
                ]
            },

			// Package front app in one file
			{
                type: 'app',
				name: 'front-app',
				js: 'deploy/js/front-app.js',
				css: 'deploy/css/front-app.css',
				app: 'src/apps/front/',
                include: [
                    'common/',
                    'pages/'
                ]
			},

			// Package back app in one file
			{
                type: 'app',
				name: 'back-app',
				js: 'deploy/js/back-app.js',
				css: 'deploy/css/back-app.css',
				app: 'src/apps/back/',
                include: [
                    'common/',
                    'pages/'
                ]
			}
		],

        // --------------------------------------------------------------------- GRUNT CONFIG
        {
            // Load package definitions
			pkg: grunt.file.readJSON('package.json'),

            // Compile less files
			less: {
                options: {
                    cleancss: false,
                    compress: false
                }
            },

            // Concat multiples files
			concat: {
                options: {

                    // Remove all comments
                    stripBanners: {
                        block: true,
                        line: true
                    },

                    // Use ES5 strict mode
                    banner: '"use strict";\n\n',
                    separator: '\n'
                }
            },

            // Typescript compilation
            ts: {
                options: {
                    // Compile modules as AMD
                    module: 'amd',

                    // Target for ES5 javascript (ie9+)
                    target: 'es5',

                    // Some stuff
                    declaration: false,
                    sourceMap: false,
                    comments: false,
                    verbose: false
                    //fast: 'never'
                }
            },

            // Requirejs compilation, preparing AMD modules and concatenating app as one file
			requirejs: {
                options: {
                    paths: {},
                    findNestedDependencies: false,
                    generateSourceMaps: false,
                    wrap: false,
                    useStrict: false,
                    optimize: "none"
                }
            },

            // Clean extends statements added by typescript compiler
            cleanTsExtends: {},

            // Add modules path available in each modules as a string
            jsModulePath: {},

            // Clean-up dirty folders
            clean: {},

            // Compile handlebars templates to JS
            handlebars: {
                options: {
                    // Where are stored templates on window
                    namespace: 'TemplateFiles'
                }
            },

            // Compile JSON files to JS
            json: {
                options: {
                    // Where are stored json files on window
                    namespace: 'JsonFiles'
                }
            },

            // Obfuscate and compress javascript
            uglify: {
                options: {
                    mangle: false,
                    report: 'gzip',
                    footer: "window.__disableLogs = true;"
                }
            },

            // Obfuscate and compress css
            cssmin: {
                options: {
                    report: 'gzip',
                    shorthandCompacting: false
                }
            },

            // Add vendor prefix for css properties
            autoprefixer: {
                options: {
                    browsers: ['last 2 versions']
                }
            },

            // Compose HTML files from handlebars templates
            assemble: {

            },

            // Watch file change
            watch: {
                options: {
                    livereload: true,
                    interrupt: true
                }
            },

            // Integrated webserver
            connect: {
                deploy: {
                    options: {
                        useAvailablePort: true,
                        base: staticConfig.projectWorkingDirectory + 'deploy/',
                        livereload: true,
                        open: true
                    }
                }
            },

            // Execute shell stuff
            shell: {}
		}
	);


	// ------------------------------------------------------------------------- TASK

    // By default, compile all bundles and watch
    grunt.registerTask('default', ['clean:all', 'all', 'connect:deploy', 'watch']);
    grunt.registerTask('start', ['connect:deploy', 'watch']);
};