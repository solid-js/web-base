module.exports = {

    /**
     * Normalize typescript module names for dynamic import.
     * This function takes an array of ts file paths and convert it in module names.
     * For example: ['../lib/provider/LibName.ts'] become ['lib/provider/LibName']
     */
    normalizeTypescriptModuleName: function (pTypescriptFiles)
    {
        var normalizedModuleNames = [];
        var firstSlashIndex;
        var currentModulePath;

        for (var i = 0; i < pTypescriptFiles.length; i ++)
        {
            currentModulePath = pTypescriptFiles[i];
            firstSlashIndex = currentModulePath.indexOf("/") + 1;
            normalizedModuleNames[i] = currentModulePath.substring(firstSlashIndex, currentModulePath.lastIndexOf("."));
        }

        return normalizedModuleNames;
    },

    /**
     *
     */
    populateGruntConfig: function (grunt, pStaticConfig, pBundles, pGruntConfig)
    {
        // Containing tasks for every bundles
        var bundleEverythingTasks = [];
        var bundleEverythingOptimisedTasks = [];

        // Typescript temp dir for compiled sources
        var typescriptDir = pStaticConfig.tempDir + 'typescript/';

        // Configuring cleaning for everything in temp folder
        pGruntConfig.clean.all = {
            src: pStaticConfig.tempDir
        };

        // Config typecript compilation
        pGruntConfig.ts.all = {
            // Output temp directory for js compiled modules
            src: pStaticConfig.typescriptReferences,
            dest: typescriptDir
        };

        // Browse bundles
        var currentConfig;
        for (var i = 0; i < pBundles.length; i ++)
        {
            // Target current bundle configuration
            currentConfig = pBundles[i];

            // Link to the compiled files in temp dir
            var currentTempDir = pStaticConfig.tempDir + currentConfig.name;
            var templateFile = currentTempDir + '/template.js';
            var jsonFile = currentTempDir + '/json.js';
            var typescriptAmdFile = currentTempDir + '/amd.js';

            // Add task for cleaning temp dir
            pGruntConfig.clean[currentConfig.name] = {
                src: currentTempDir
            };

            // ------------------------------------------------------------------------------
            // ----------------------------------------------------------------- APP BUNDLE -
            // ------------------------------------------------------------------------------
            if (currentConfig.type == "app")
            {
                // Included files out of the dependency tree
                var includedTypescriptFiles = [
                    // Include main file
                    pStaticConfig.projectWorkingDirectory + currentConfig.app + pStaticConfig.typescriptMainFile + '.ts'
                ];
                var includedLessFiles = [
                    // Include main file
                    pStaticConfig.projectWorkingDirectory + currentConfig.app + pStaticConfig.typescriptMainFile + '.less'
                ];

                // If we have to include files that are not in the dependencies tree
                if ('include' in currentConfig)
                {
                    // Map Included TS files
                    currentConfig['include'].every(function (pIncludedPath)
                    {
                        includedTypescriptFiles.push(pStaticConfig.projectWorkingDirectory + currentConfig.app + pIncludedPath + '**/*.ts');
                    });

                    // Map included LESS files
                    currentConfig['include'].every(function (pIncludedPath)
                    {
                        includedLessFiles.push(pStaticConfig.projectWorkingDirectory + currentConfig.app + pIncludedPath + '**/*.less');
                    });
                }

                // ------------------------------------------------------------- TEMPLATES

                // Include every template files
                pGruntConfig.handlebars[currentConfig.name] = {
                    src: pStaticConfig.projectWorkingDirectory + currentConfig.app + '**/*.hbs',
                    dest: templateFile,
                    options: {
                        // Where are stored templates
                        namespace: pGruntConfig.handlebars.options.namespace,

                        // Use namespace for partials loading
                        partialsUseNamespace: true,

                        // Get only the filename without extension
                        processName: function (pName) {
                            return module.exports.normalizeTypescriptModuleName([pName]);
                        }
                    }
                };

                // ------------------------------------------------------------- JSON

                // Include every template files
                pGruntConfig.json[currentConfig.name] = {
                    src: pStaticConfig.projectWorkingDirectory + currentConfig.app + '*/**/*.json',
                    dest: jsonFile,
                    options: {
                        // Where are stored JSONs
                        namespace: pGruntConfig.json.options.namespace,

                        // Get only the filename without extension
                        includePath: true,
                        processName: function (pName) {
                            return module.exports.normalizeTypescriptModuleName([pName]);
                        }
                    }
                };

                // ------------------------------------------------------------- SCRIPTS

                // Include not required TS files
                includedTypescriptFiles.every(function (element) {
                    pGruntConfig.ts.all.src.push(element);
                });

                // Config requirejs amd packaging
                pGruntConfig.requirejs[currentConfig.name] = {
                    options: {
                        // Base dir for require statements
                        baseUrl: typescriptDir,

                        // Output typescript file
                        out: typescriptAmdFile,

                        // Included files who are not required
                        include: module.exports.normalizeTypescriptModuleName(
                            grunt.file.expand({filter: 'isFile'}, includedTypescriptFiles)
                        )
                    }
                };

                // Clean typescript extends injections (only the first __extends statement will stay in the file)
                pGruntConfig.cleanTsExtends[currentConfig.name] = {
                    src: typescriptAmdFile
                };

                // Inject AMD module path to each modules
                pGruntConfig.jsModulePath[currentConfig.name] = {
                    src: typescriptAmdFile
                };

                // Concat bundle files
                pGruntConfig.concat[currentConfig.name] = {
                    src: [
                        // Templates
                        templateFile,

                        // JSON files
                        jsonFile,

                        // AMD modules
                        typescriptAmdFile
                    ],
                    dest: pStaticConfig.projectWorkingDirectory + currentConfig.js
                };

                // ------------------------------------------------------------- STYLES

                // Config less compilation for this app bundle
                pGruntConfig.less[currentConfig.name] = {
                    src: includedLessFiles,
                    dest: pStaticConfig.projectWorkingDirectory + currentConfig.css
                };

                // Config auto-prefixer
                pGruntConfig.autoprefixer[currentConfig.name] = {
                    src: pStaticConfig.projectWorkingDirectory + currentConfig.css,
                    dest: pStaticConfig.projectWorkingDirectory + currentConfig.css
                };

                // ------------------------------------------------------------- OPTIMISING

                // Javascript obfuscation
                pGruntConfig.uglify[currentConfig.name] = {
                    src: pStaticConfig.projectWorkingDirectory + currentConfig.js,
                    dest: pStaticConfig.projectWorkingDirectory + currentConfig.js
                };

                // Less obfuscation
                pGruntConfig.cssmin[currentConfig.name] = {
                    src: pStaticConfig.projectWorkingDirectory + currentConfig.css,
                    dest: pStaticConfig.projectWorkingDirectory + currentConfig.css
                };

                // ------------------------------------------------------------- WATCH

                // Template then concat from hbs files
                pGruntConfig.watch[currentConfig.name + '-template'] = {
                    files: [pStaticConfig.projectWorkingDirectory + currentConfig.app + '**/*.hbs'],
                    tasks: [currentConfig.name + ':template', currentConfig.name + ':concat']
                };

                // Json then concat from json files
                pGruntConfig.watch[currentConfig.name + '-json'] = {
                    files: [pStaticConfig.projectWorkingDirectory + currentConfig.app + '**/*.json'],
                    tasks: [currentConfig.name + ':json', currentConfig.name + ':concat']
                };

                // Script then concat from ts files
                pGruntConfig.watch[currentConfig.name + '-script'] = {
                    files: [pStaticConfig.projectWorkingDirectory + currentConfig.app + '**/*.ts'],
                    tasks: [currentConfig.name + ':amd', currentConfig.name + ':concat']
                };

                // Style from less files
                pGruntConfig.watch[currentConfig.name + '-style'] = {
                    files: [pStaticConfig.projectWorkingDirectory + currentConfig.app + '**/*.less'],
                    tasks: [currentConfig.name + ':style']
                };

                // ------------------------------------------------------------- TASKS REGISTERING

                /**
                 * Compile scripts to temp dir
                 */

                // Compile templates
                grunt.registerTask(currentConfig.name + ':template', [
                    'handlebars:' + currentConfig.name
                ]);

                // Compile JSON
                grunt.registerTask(currentConfig.name + ':json', [
                    'json:' + currentConfig.name
                ]);

                // Compile Typescript / AMD
                grunt.registerTask(currentConfig.name + ':amd', [
                    'ts:all',
                    'requirejs:' + currentConfig.name,
                    'cleanTsExtends:' + currentConfig.name,
                    'jsModulePath:' + currentConfig.name
                ]);

                /**
                 * Publish scripts to output
                 */

                // Concat compiled scripts (templates / json / amd from temp to output)
                grunt.registerTask(currentConfig.name + ':concat', [
                    'concat:' + currentConfig.name
                ]);

                // Compile scripts and concat them
                grunt.registerTask(currentConfig.name + ':script', [
                    currentConfig.name + ':template',
                    currentConfig.name + ':json',
                    currentConfig.name + ':amd',
                    currentConfig.name + ':concat'
                ]);

                // Compile style to output (no temp involved)
                grunt.registerTask(currentConfig.name + ':style', [
                    'less:' + currentConfig.name,
                    'autoprefixer:' + currentConfig.name
                ]);

                /**
                 * Register task for everything in this bundle
                 * 1. Cleaning temp dir
                 * 2. Templates / Json / Typescript / AMD
                 * 3. Concat scripts to output
                 * 4. Styles to output
                 */
                grunt.registerTask(currentConfig.name, [
                    currentConfig.name + ':script',
                    currentConfig.name + ':style'
                ]);

                // Everything in bundle + optimise script and style for production
                grunt.registerTask(currentConfig.name + ':optimised', [
                    currentConfig.name,
                    'uglify:' + currentConfig.name,
                    'cssmin:' + currentConfig.name
                ]);
            }

            // -----------------------------------------------------------------------------------
            // ----------------------------------------------------------------- JS / CSS BUNDLE -
            // -----------------------------------------------------------------------------------
            else if (currentConfig.type == "css" || currentConfig.type == "js")
            {
                // Add project root the each files path
                var sources = currentConfig.src.map(function (pFileName) {
                    return pStaticConfig.projectWorkingDirectory + pFileName;
                });
                var destination = pStaticConfig.projectWorkingDirectory + currentConfig.dest;

                // JS
                if (currentConfig.type == "js")
                {
                    // Typescript and JS files separated
                    var typescriptSrc = [];
                    var jsSrc = [];

                    // Browse sources to separate TS and JS files
                    var currentSrc;
                    for (var j = 0; j < sources.length; j ++)
                    {
                        // Target current source
                        currentSrc = sources[j];

                        // If we have TS files
                        if (currentSrc.toLowerCase().lastIndexOf('.ts') == currentSrc.length - 3)
                        {
                            // Add to TS compiler
                            pGruntConfig.ts.all.src.push(currentSrc);

                            // Add to TS files for AMD
                            typescriptSrc.push(currentSrc);
                        }

                        // Everything else are JS files
                        else
                        {
                            // Add to JS
                            jsSrc.push(currentSrc);
                        }
                    }

                    // The compile task (just concat if no TS files)
                    var compileTask = [
                        'concat:' + currentConfig.name
                    ];

                    // If we have TS files in this bundle
                    if (typescriptSrc.length > 0)
                    {
                        // Config requirejs amd packaging
                        pGruntConfig.requirejs[currentConfig.name] = {
                            options: {
                                // Base dir for require statements
                                baseUrl: typescriptDir,

                                // Output typescript file
                                out: typescriptAmdFile,

                                // Included files who are not required
                                include: module.exports.normalizeTypescriptModuleName(
                                    grunt.file.expand({filter: 'isFile'}, typescriptSrc)
                                )
                            }
                        };

                        // Add JS output to the end of the concat
                        jsSrc.push(typescriptAmdFile);

                        // Add TS compilation THEN AMD modules (unshift FTW)
                        compileTask.unshift('requirejs:' + currentConfig.name);
                        compileTask.unshift('ts:all');
                    }

                    // Concat bundle files
                    pGruntConfig.concat[currentConfig.name] = {
                        src: jsSrc,
                        dest: destination
                    };

                    // Javascript obfuscation
                    pGruntConfig.uglify[currentConfig.name] = {
                        src: destination,
                        dest: destination
                    };

                    // Register the compile task
                    grunt.registerTask(currentConfig.name, compileTask);

                    // Compile script and optimise
                    grunt.registerTask(currentConfig.name + ':optimised', [
                        currentConfig.name,
                        'uglify:' + currentConfig.name
                    ]);
                }

                // LESS
                else if (currentConfig.type == "css")
                {
                    // Concat bundle files
                    pGruntConfig.less[currentConfig.name] = {
                        src: sources,
                        dest: destination
                    };

                    // Less obfuscation
                    pGruntConfig.cssmin[currentConfig.name] = {
                        src: destination,
                        dest: destination
                    };

                    // Compile script
                    grunt.registerTask(currentConfig.name, [
                        'less:' + currentConfig.name
                    ]);

                    // Compile script and optimise
                    grunt.registerTask(currentConfig.name + ':optimised', [
                        currentConfig.name,
                        'cssmin:' + currentConfig.name
                    ]);
                }

                // Watch from js / css files changes
                pGruntConfig.watch[currentConfig.name] = {
                    files: sources,
                    tasks: [currentConfig.name]
                };
            }

            // ----------------------------------------------------------------- UNKNOW
            else if (!('type' in currentConfig) || currentConfig == null)
            {
                throw new Error("Please specify bundle type.");
            }
            else
            {
                throw new Error("Unknow bundle type " + currentConfig.type);
            }

            // Add this task to the every bundles task
            bundleEverythingTasks.push(currentConfig.name);
            bundleEverythingOptimisedTasks.push(currentConfig.name + ':optimised');
        }

        // TODO : SVG sprites
        // TODO : texture packer sprites

        // Compile all bundle
        grunt.registerTask('all', bundleEverythingTasks);

        // Compile all bundle and optimise them
        grunt.registerTask('optimised', bundleEverythingOptimisedTasks);

        // Init populated config
        grunt.initConfig(pGruntConfig);
    }
};