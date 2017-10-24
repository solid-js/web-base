var JsonFiles = JsonFiles || {};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('lib/solidify/core/App', ["require", "exports", "./Disposable", "../helpers/DependencyManager", "./Config", "../utils/EnvUtils"], function (require, exports, Disposable_1, DependencyManager_1, Config_1, EnvUtils_1) {

    var __FILE = 'lib/solidify/core/App';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = (function (_super) {
        __extends(App, _super);
        function App(pAppParams) {
            var _this = _super.call(this) || this;
            _this.patchAppBase(pAppParams);
            _this.initConfig();
            _this.injectConfig(pAppParams);
            _this.initDependencyManager();
            _this.initModules();
            _this.initDependencies();
            _this.initEnv();
            _this.dependencyManager.updateModuleCache(function (pLoadedModules) {
                _this.initRoutes();
                _this.initAppView();
                _this.ready();
            });
            return _this;
        }
        Object.defineProperty(App.prototype, "dependencyManager", {
            get: function () { return this._dependencyManager; },
            enumerable: true,
            configurable: true
        });
        App.prototype.patchAppBase = function (pAppParams) {
            if (pAppParams == null || !('base' in pAppParams)) {
                var $baseMeta = $('head > base');
                if ($baseMeta.length > 0) {
                    pAppParams['base'] = $baseMeta.attr('href');
                }
            }
        };
        App.prototype.initConfig = function () {
        };
        App.prototype.injectConfig = function (pAppParams) {
            Config_1.Config.instance.inject(pAppParams);
            this._params = Config_1.Config.getAll();
        };
        App.prototype.initEnv = function () {
            EnvUtils_1.EnvUtils.addClasses();
        };
        App.prototype.initDependencyManager = function () {
            this._dependencyManager = DependencyManager_1.DependencyManager.getInstance();
        };
        App.prototype.initModules = function () {
            throw new Error("App.initModules // Please override App.initModule method to register module paths using DependencyManager.registerModulePath.");
        };
        App.prototype.initDependencies = function () {
            throw new Error("App.initDependencies // Please override App.initDependencies to map app dependencies using DependencyManager.registerClass or DependencyManager.registerInstance.");
        };
        App.prototype.initAppView = function () {
            throw new Error("App.initAppView // Please override App.initAppView to create application main view.");
        };
        App.prototype.initRoutes = function () {
            throw new Error("App.initRoutes // Please override App.initRoutes to map app routes.");
        };
        App.prototype.ready = function () { };
        return App;
    }(Disposable_1.Disposable));
    exports.App = App;
});


define('lib/solidify/core/Config', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/core/Config';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Config = (function () {
        function Config() {
            this._params = {};
        }
        Object.defineProperty(Config, "instance", {
            get: function () {
                if (Config.__instance == null) {
                    Config.__instance = new Config();
                }
                return Config.__instance;
            },
            enumerable: true,
            configurable: true
        });
        Config.getAll = function () {
            return this.instance.getAll();
        };
        Config.getFromName = function (pVarName) {
            return this.instance.getFromName(pVarName);
        };
        Config.prototype.inject = function (pProps) {
            for (var i in pProps) {
                this._params[i] = pProps[i];
            }
        };
        Config.prototype.getAll = function () {
            return this._params;
        };
        Config.prototype.getFromName = function (pVarName) {
            return this._params[pVarName];
        };
        return Config;
    }());
    exports.Config = Config;
});


define('lib/solidify/core/Disposable', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/core/Disposable';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Disposable = (function () {
        function Disposable() {
            this._isDisposed = false;
        }
        Object.defineProperty(Disposable.prototype, "isDisposed", {
            get: function () { return this._isDisposed; },
            enumerable: true,
            configurable: true
        });
        Disposable.prototype.dispose = function () {
            this._isDisposed = true;
        };
        return Disposable;
    }());
    exports.Disposable = Disposable;
});


define('lib/solidify/helpers/DependencyManager', ["require", "exports", "../utils/StringUtils", "../utils/ModuleUtils", "../utils/ArrayUtils"], function (require, exports, StringUtils_1, ModuleUtils_1, ArrayUtils_1) {

    var __FILE = 'lib/solidify/helpers/DependencyManager';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DependencyManager = (function () {
        function DependencyManager() {
            this._modulesPath = {};
            this._dependencies = {};
        }
        DependencyManager.getInstance = function () {
            if (this.__instance == null) {
                this.__instance = new DependencyManager();
            }
            return this.__instance;
        };
        DependencyManager.prototype.registerModulePath = function (pModuleType, pModulePath) {
            pModuleType = pModuleType.toLowerCase();
            if (!(pModuleType in this._modulesPath)) {
                this._modulesPath[pModuleType] = [];
            }
            this._modulesPath[pModuleType].push(StringUtils_1.StringUtils.trailingSlash(pModulePath));
        };
        DependencyManager.prototype.registerModulesPath = function (pPaths) {
            for (var moduleType in pPaths) {
                moduleType = moduleType.toLowerCase();
                if (!(moduleType in this._modulesPath)) {
                    this._modulesPath[moduleType] = [];
                }
                for (var modulePathIndex in pPaths[moduleType]) {
                    this._modulesPath[moduleType].push(StringUtils_1.StringUtils.trailingSlash(pPaths[moduleType][modulePathIndex]));
                }
            }
        };
        DependencyManager.prototype.getFlatModulesPath = function () {
            var modulesPath = [];
            for (var moduleType in this._modulesPath) {
                for (var pathIndex in this._modulesPath[moduleType]) {
                    modulesPath.push(this._modulesPath[moduleType][pathIndex]);
                }
            }
            return modulesPath;
        };
        DependencyManager.prototype.getFlatModulesTypes = function () {
            var modulesType = [];
            for (var moduleType in this._modulesPath) {
                if (!ArrayUtils_1.ArrayUtils.inArray(modulesType, moduleType)) {
                    modulesType.push(moduleType);
                }
            }
            return modulesType;
        };
        DependencyManager.prototype.updateModuleCache = function (pHandler) {
            var modulesPath = this.getFlatModulesPath();
            ModuleUtils_1.ModuleUtils.preloadModules(modulesPath, function (pLoadedModules) {
                pHandler(pLoadedModules);
            });
        };
        DependencyManager.prototype.requireModule = function (pModuleName, pModuleType, pConstructorArguments, pExportName) {
            if (pConstructorArguments === void 0) { pConstructorArguments = null; }
            if (pExportName === void 0) { pExportName = 'default'; }
            pModuleType = pModuleType.toLowerCase();
            var loadedModules = ModuleUtils_1.ModuleUtils.getLoadedModulesNames();
            var loadedModulesByKey = {};
            for (var moduleName in loadedModules) {
                loadedModulesByKey[moduleName.toLowerCase()] = moduleName;
            }
            var currentModulePath;
            var localModulePath;
            var fullModulePath;
            if (!(pModuleType in this._modulesPath)) {
                throw new Error("DependencyManager.requireModule // Module type " + pModuleType + " not found when loading " + pModuleName + ".");
            }
            for (var modulePathIndex in this._modulesPath[pModuleType]) {
                localModulePath = this._modulesPath[pModuleType][modulePathIndex];
                currentModulePath = (localModulePath + pModuleName + "/" + pModuleName).toLowerCase();
                if (loadedModulesByKey[currentModulePath] != null) {
                    fullModulePath = loadedModulesByKey[currentModulePath];
                    break;
                }
            }
            if (fullModulePath == null) {
                throw new Error("DependencyManager.requireModule // Module " + pModuleName + " not found with type " + pModuleType + ". Please check if the module is loaded or update modules caches.");
            }
            var module = ModuleUtils_1.ModuleUtils.requireSync(loadedModulesByKey[currentModulePath]);
            var moduleExport;
            var moduleFileName = StringUtils_1.StringUtils.getFileFromPath(fullModulePath);
            if (pExportName in module) {
                moduleExport = module[pExportName];
            }
            else if (moduleFileName in module) {
                moduleExport = module[moduleFileName];
            }
            else {
                console.log(module);
                throw new Error("DependencyManager.requireModule // Module " + pModuleName + " is found with type " + pModuleType + " but the export " + pExportName + " is not found.");
            }
            return this.instanciateModule(moduleExport, pConstructorArguments);
        };
        DependencyManager.prototype.instanciateModule = function (pModuleReference, pConstructorArguments) {
            if (pConstructorArguments === void 0) { pConstructorArguments = null; }
            return (pConstructorArguments == null
                ? pModuleReference
                : ModuleUtils_1.ModuleUtils.dynamicNew(pModuleReference, pConstructorArguments));
        };
        DependencyManager.prototype.checkAlreadyRegisteredDependency = function (pName) {
            if (pName in this._dependencies) {
                throw new Error("DependencyManager.register[Instance|Class] // " + pName + " is already registered. Please delete it with deleteDependecy before.");
            }
        };
        DependencyManager.prototype.registerInstance = function (pName, pInstance) {
            this.checkAlreadyRegisteredDependency(pName);
            this._dependencies[pName] = {
                instance: pInstance,
                classRef: null,
                singleton: true
            };
        };
        DependencyManager.prototype.registerClass = function (pName, pClass, pSingleton) {
            if (pSingleton === void 0) { pSingleton = false; }
            this.checkAlreadyRegisteredDependency(pName);
            this._dependencies[pName] = {
                instance: null,
                classRef: pClass,
                singleton: pSingleton
            };
        };
        DependencyManager.prototype.requireInstance = function (pName) {
            if (!(pName in this._dependencies)) {
                throw new Error("DependencyManager.requireInstance // " + pName + " instance not found.");
            }
            var currentDependency = this._dependencies[pName];
            if ((currentDependency.classRef != null
                &&
                    currentDependency.instance == null)
                ||
                    !currentDependency.singleton) {
                currentDependency.instance = new currentDependency.classRef;
            }
            return currentDependency.instance;
        };
        DependencyManager.prototype.removeDependency = function (pName) {
            throw new Error('DependencyManager.error // TODO');
        };
        return DependencyManager;
    }());
    exports.DependencyManager = DependencyManager;
});


var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('lib/solidify/helpers/Signal', ["require", "exports", "../core/Disposable"], function (require, exports, Disposable_1) {

    var __FILE = 'lib/solidify/helpers/Signal';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Signal = (function (_super) {
        __extends(Signal, _super);
        function Signal() {
            var _this = _super.call(this) || this;
            _this._id = 0;
            _this._listeners = [];
            return _this;
        }
        Object.defineProperty(Signal.prototype, "length", {
            get: function () { return this._listeners.length; },
            enumerable: true,
            configurable: true
        });
        Signal.prototype.add = function (pHandler, pScope) {
            if (pScope === void 0) { pScope = null; }
            return this.register(pScope, pHandler, false);
        };
        Signal.prototype.addOnce = function (pHandler, pScope) {
            if (pScope === void 0) { pScope = null; }
            return this.register(pScope, pHandler, true);
        };
        Signal.prototype.register = function (pScope, pHandler, pOnce) {
            this._listeners.push({
                scope: pScope,
                handler: pHandler,
                once: pOnce,
                id: ++this._id
            });
            return this._id;
        };
        Signal.prototype.dispatch = function () {
            var rest = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                rest[_i] = arguments[_i];
            }
            var results = [];
            var currentListener;
            var currentResult;
            var listenersToRemove = [];
            var listenerIndex = 0;
            var total = this._listeners.length;
            for (listenerIndex = 0; listenerIndex < total; listenerIndex++) {
                currentListener = this._listeners[listenerIndex];
                currentResult = currentListener.handler.apply(currentListener.scope, rest);
                if (currentResult != null && currentResult != undefined) {
                    results.push(currentResult);
                }
                if (currentListener.once) {
                    listenersToRemove.push(currentListener);
                }
            }
            total = listenersToRemove.length;
            for (listenerIndex = 0; listenerIndex < total; listenerIndex++) {
                this.remove(listenersToRemove[listenerIndex].handler);
            }
            return results;
        };
        Signal.prototype.remove = function (pHandlerId) {
            var newListeners = [];
            var currentListener;
            var listenerDeleted = false;
            var total = this._listeners.length;
            for (var listenerIndex = 0; listenerIndex < total; listenerIndex++) {
                currentListener = this._listeners[listenerIndex];
                if ((typeof pHandlerId == "function"
                    &&
                        currentListener.handler == pHandlerId)
                    ||
                        (typeof pHandlerId == "number"
                            &&
                                currentListener.id == pHandlerId)) {
                    listenerDeleted = true;
                }
                else {
                    newListeners.push(currentListener);
                }
            }
            this._listeners = newListeners;
            return listenerDeleted;
        };
        Signal.prototype.dispose = function () {
            this._listeners = null;
            _super.prototype.dispose.call(this);
        };
        return Signal;
    }(Disposable_1.Disposable));
    exports.Signal = Signal;
});


define('lib/solidify/navigation/IPage', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/navigation/IPage';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});


define('lib/solidify/navigation/IPageStack', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/navigation/IPageStack';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});


define('lib/solidify/navigation/Router', ["require", "exports", "../utils/StringUtils", "../utils/ArrayUtils", "../helpers/Signal"], function (require, exports, StringUtils_1, ArrayUtils_1, Signal_1) {

    var __FILE = 'lib/solidify/navigation/Router';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Router = (function () {
        function Router(pBase, pRoutes) {
            if (pBase === void 0) { pBase = ''; }
            if (pRoutes === void 0) { pRoutes = null; }
            var _this = this;
            this._isStarted = false;
            this._routes = [];
            this._onRouteChanged = new Signal_1.Signal();
            this._onNotFound = new Signal_1.Signal();
            this.linkClickedHandler = function (pEvent) {
                pEvent.preventDefault();
                var $target = $(pEvent.currentTarget);
                var fullPath = $target.attr('href');
                if (fullPath == null)
                    return;
                _this.openURL(fullPath);
            };
            this._firstPageView = true;
            this._stacks = {};
            this.popStateHandler = function (pEvent) {
                _this.updateCurrentRoute();
            };
            Router.__INSTANCE = this;
            this.base = pBase;
            this.addRoutes(pRoutes);
            window.addEventListener('popstate', this.popStateHandler);
        }
        Object.defineProperty(Router, "instance", {
            get: function () {
                if (Router.__INSTANCE == null) {
                    throw new Error('Router.instance // Please create router in app Main file before using it.');
                }
                return Router.__INSTANCE;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "base", {
            get: function () { return this._base; },
            set: function (value) {
                value = StringUtils_1.StringUtils.leadingSlash(value, true);
                value = StringUtils_1.StringUtils.trailingSlash(value, true);
                this._base = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "routes", {
            get: function () { return this._routes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "currentPath", {
            get: function () { return this._currentPath; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "currentRouteMatch", {
            get: function () { return this._currentRouteMatch; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "onRouteChanged", {
            get: function () { return this._onRouteChanged; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "onNotFound", {
            get: function () { return this._onNotFound; },
            enumerable: true,
            configurable: true
        });
        Router.prototype.listenLinks = function (pLinkSignature) {
            if (pLinkSignature === void 0) { pLinkSignature = 'a[data-internal-link]'; }
            $(document).on('click', pLinkSignature, this.linkClickedHandler);
        };
        Router.prototype.trackCurrentPage = function () {
            if (this._firstPageView) {
                this._firstPageView = false;
                return;
            }
            console[('ga' in window ? 'info' : 'warn')]('Router.trackingPage // ' + this._currentPath);
            if ('ga' in window) {
                window['ga']('send', 'pageview', this._currentPath);
            }
        };
        Router.prototype.addRoutes = function (pRoutes) {
            var _this = this;
            if (pRoutes == null)
                return;
            pRoutes.map(function (route) {
                _this.prepareRoute(route);
                _this._routes.push(route);
            });
        };
        Router.prototype.prepareRoute = function (pRoute) {
            if (pRoute.page == null || pRoute.page == '') {
                throw new Error("Router.prepareRoute // Invalid route \"" + pRoute.url + "\", property \"page\" have to be not null ans not empty.");
            }
            if (pRoute.action == null || pRoute.action == '') {
                pRoute.action = 'index';
            }
            if (pRoute.stack == null || pRoute.stack == '') {
                pRoute.stack = 'main';
            }
            var url = pRoute.url;
            var start = url.indexOf(Router.LEFT_PARAMETERS_DELIMITER);
            var end = 0;
            var pattern = '';
            pRoute._matchingParameter = [];
            while (start != -1 && end != -1) {
                start = url.indexOf(Router.LEFT_PARAMETERS_DELIMITER);
                end = url.indexOf(Router.RIGHT_PARAMETER_DELIMITER);
                pRoute._matchingParameter.push(url.substring(start + 1, end));
                pattern += url.substring(0, start) + '%%PARAMETER%%';
                url = url.substring(end + 1, url.length);
                start = url.indexOf(Router.LEFT_PARAMETERS_DELIMITER);
            }
            pattern += url.substring(0, url.length);
            pattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\+/g, '\\+')
                .replace(/\*/g, '\\*')
                .replace(/\$/g, '\\$')
                .replace(/\/$/, '/?');
            pattern = pattern.replace(new RegExp("(\%\%PARAMETER\%\%)", 'g'), Router.PARAMETER_RULE);
            pRoute._matchingRegex = new RegExp("^" + pattern + "$");
        };
        Router.prototype.registerStack = function (pStackName, pStack) {
            if (pStackName in this._stacks) {
                throw new Error("Router.registerStack // Stack " + pStackName + " already registered");
            }
            if (pStack == null) {
                throw new Error("Router.registerStack // Can't register a null stack.");
            }
            this._stacks[pStackName] = pStack;
        };
        Router.prototype.getStackByName = function (pStackName) {
            return ((pStackName in this._stacks)
                ? this._stacks[pStackName]
                : null);
        };
        Router.prototype.updateCurrentRoute = function () {
            if (this._isStarted) {
                this._currentPath = location.pathname;
                this.trackCurrentPage();
                console.info('Router.updateCurrentRoute // Route', this._currentPath);
                this._currentRouteMatch = this.URLToRoute(this._currentPath);
                if (this._currentRouteMatch == null) {
                    this._onNotFound.dispatch();
                    var mainStack = this.getStackByName('main');
                    if (mainStack != null) {
                        mainStack.showPage('NotFoundPage', 'index', {});
                    }
                }
                else {
                    this._onRouteChanged.dispatch(this._currentRouteMatch);
                    if (this._currentRouteMatch._fromRoute != null) {
                        if (this._currentRouteMatch._fromRoute.handler != null) {
                            this._currentRouteMatch._fromRoute.handler(this._currentRouteMatch);
                        }
                    }
                    var stack = this.getStackByName(this._currentRouteMatch.stack);
                    if (this._currentRouteMatch.stack != 'main' && stack == null) {
                        throw new Error("Router.updateCurrentRoute // Stack " + this._currentRouteMatch.stack + " is not registered.");
                    }
                    (stack != null) && stack.showPage(this._currentRouteMatch.page, this._currentRouteMatch.action, this._currentRouteMatch.parameters);
                }
            }
        };
        Router.prototype.prepareURL = function (pURL) {
            var doubleSlashIndex = pURL.indexOf('//');
            if (doubleSlashIndex >= 0 && doubleSlashIndex < 7) {
                var firstSlashIndex = pURL.indexOf('/', doubleSlashIndex + 2);
                pURL = pURL.substr(firstSlashIndex, pURL.length);
            }
            pURL = StringUtils_1.StringUtils.leadingSlash(pURL, true);
            if (pURL.indexOf(this._base) != 0) {
                pURL = this._base + StringUtils_1.StringUtils.leadingSlash(pURL, false);
            }
            return pURL;
        };
        Router.prototype.URLToRoute = function (pURL) {
            pURL = this.prepareURL(pURL);
            var pathWithoutBase = StringUtils_1.StringUtils.leadingSlash(pURL.split(this._base, 2)[1], true);
            var foundRoute;
            this._routes.every(function (route) {
                var routeExec = route._matchingRegex.exec(pathWithoutBase);
                if (routeExec != null) {
                    routeExec.shift();
                    delete routeExec.input;
                    delete routeExec.index;
                    var parameters = {};
                    for (var k in routeExec) {
                        parameters[route._matchingParameter[k]] = routeExec[k];
                    }
                    foundRoute = {
                        page: route.page,
                        action: route.action,
                        stack: route.stack,
                        parameters: parameters
                    };
                    foundRoute._fromRoute = route;
                    return false;
                }
                else
                    return true;
            });
            return foundRoute;
        };
        Router.prototype.routeToURL = function (pRouteMatch, pPrependBase) {
            if (pPrependBase === void 0) { pPrependBase = true; }
            if (pRouteMatch.action == null || pRouteMatch.action == '') {
                pRouteMatch.action = 'index';
            }
            if (pRouteMatch.stack == null || pRouteMatch.stack == '') {
                pRouteMatch.stack = 'main';
            }
            if (pRouteMatch.parameters == null) {
                pRouteMatch.parameters = {};
            }
            var foundURL;
            this._routes.every(function (route) {
                if (route.page == pRouteMatch.page
                    &&
                        route.action == pRouteMatch.action
                    &&
                        route.stack == pRouteMatch.stack) {
                    for (var i in pRouteMatch.parameters) {
                        if (!ArrayUtils_1.ArrayUtils.inArray(route._matchingParameter, i)) {
                            return true;
                        }
                    }
                    foundURL = route.url.replace(Router.PARAMETER_REPLACE_RULE, function (i, pMatch) {
                        return StringUtils_1.StringUtils.slugify(pRouteMatch.parameters[pMatch]);
                    });
                    return false;
                }
                else
                    return true;
            });
            if (foundURL == null)
                return null;
            return (pPrependBase
                ? this._base + StringUtils_1.StringUtils.leadingSlash(foundURL, false)
                : foundURL);
        };
        Router.prototype.openURL = function (pURL, pAddToHistory) {
            if (pAddToHistory === void 0) { pAddToHistory = true; }
            pURL = this.prepareURL(pURL);
            pAddToHistory
                ? window.history.pushState(null, null, pURL)
                : window.history.replaceState(null, null, pURL);
            this.updateCurrentRoute();
        };
        Router.prototype.openPage = function (pRouteMatch, pAddToHistory) {
            if (pAddToHistory === void 0) { pAddToHistory = true; }
            var url = this.routeToURL(pRouteMatch);
            if (url == null) {
                throw new Error("Router.openPage // Route not found.");
            }
            this.openURL(url, pAddToHistory);
        };
        Router.prototype.start = function () {
            this._isStarted = true;
            this.updateCurrentRoute();
        };
        Router.prototype.stop = function () {
            this._isStarted = false;
        };
        return Router;
    }());
    Router.LEFT_PARAMETERS_DELIMITER = '{';
    Router.RIGHT_PARAMETER_DELIMITER = '}';
    Router.PARAMETER_RULE = '([0-9a-zA-Z\_\%\+\-]+)';
    Router.PARAMETER_REPLACE_RULE = /\{(.*?)\}/g;
    exports.Router = Router;
});


var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('lib/solidify/react/ReactView', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/react/ReactView';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ReactView = (function (_super) {
        __extends(ReactView, _super);
        function ReactView(props, context) {
            var _this = _super.call(this, props, context) || this;
            _this.prepare();
            return _this;
        }
        ReactView.prototype.prepare = function () { };
        ReactView.prototype.initState = function (pState, pCallback) {
            if (this.state == null) {
                this.state = pState;
                pCallback && pCallback();
            }
            else
                _super.prototype.setState.call(this, pState, pCallback);
        };
        ReactView.prototype.$ = function (pRefName) {
            var _this = this;
            if (Array.isArray(pRefName)) {
                return $(pRefName.map(function (pSubName) {
                    return exports.ReactDom.findDOMNode(_this.refs[pSubName]);
                }));
            }
            else {
                return $(exports.ReactDom.findDOMNode(this.refs[pRefName]));
            }
        };
        ReactView.prototype.refNodes = function (pRefName, pKey, pComponent) {
            var _this = this;
            var arrayName = '_' + pRefName;
            var jqueryName = '$' + pRefName;
            if (!(arrayName in this)) {
                this[arrayName] = [];
            }
            if (pComponent == null) {
                delete this[arrayName][pKey];
            }
            else {
                this[arrayName][pKey] = pComponent;
            }
            this[jqueryName] = $(Object.keys(this[arrayName]).map(function (pComponent) {
                return exports.ReactDom.findDOMNode(_this[arrayName][pComponent]);
            }));
        };
        return ReactView;
    }(__React.Component));
    exports.ReactView = ReactView;
    exports.React = __React;
    exports.ReactDom = __React.__DOM;
});


define('lib/solidify/utils/ArrayUtils', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/utils/ArrayUtils';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ArrayUtils = (function () {
        function ArrayUtils() {
        }
        ArrayUtils.inArray = function (pArray, pElement) {
            for (var i in pArray) {
                if (pArray[i] == pElement)
                    return true;
            }
            return false;
        };
        ArrayUtils.deleteWhere = function (pArray, pWhere) {
            var newArray = [];
            for (var i in pArray) {
                for (var j in pWhere) {
                    if (!(j in pArray[i]) || pWhere[j] != pArray[i][j]) {
                        newArray.push(pArray[i]);
                        break;
                    }
                }
            }
            return newArray;
        };
        ArrayUtils.removeElement = function (pArray, pElement) {
            var newArray = [];
            for (var i in pArray) {
                if (pArray[i] != pElement) {
                    newArray.push(pArray[i]);
                }
            }
            return newArray;
        };
        ArrayUtils.shuffle = function (pArray) {
            var currentIndex = pArray.length;
            var temporaryValue;
            var randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = pArray[currentIndex];
                pArray[currentIndex] = pArray[randomIndex];
                pArray[randomIndex] = temporaryValue;
            }
            return pArray;
        };
        return ArrayUtils;
    }());
    exports.ArrayUtils = ArrayUtils;
});


define('lib/solidify/utils/EnvUtils', ["require", "exports", "./StringUtils"], function (require, exports, StringUtils_1) {

    var __FILE = 'lib/solidify/utils/EnvUtils';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EDeviceType;
    (function (EDeviceType) {
        EDeviceType[EDeviceType["HANDHELD"] = 0] = "HANDHELD";
        EDeviceType[EDeviceType["DESKTOP"] = 1] = "DESKTOP";
    })(EDeviceType = exports.EDeviceType || (exports.EDeviceType = {}));
    var EPlatform;
    (function (EPlatform) {
        EPlatform[EPlatform["IOS"] = 0] = "IOS";
        EPlatform[EPlatform["ANDROID"] = 1] = "ANDROID";
        EPlatform[EPlatform["WINDOWS"] = 2] = "WINDOWS";
        EPlatform[EPlatform["MAC"] = 3] = "MAC";
        EPlatform[EPlatform["UNKNOWN"] = 4] = "UNKNOWN";
    })(EPlatform = exports.EPlatform || (exports.EPlatform = {}));
    var EBrowser;
    (function (EBrowser) {
        EBrowser[EBrowser["CHROME"] = 0] = "CHROME";
        EBrowser[EBrowser["SAFARI"] = 1] = "SAFARI";
        EBrowser[EBrowser["IE"] = 2] = "IE";
        EBrowser[EBrowser["EDGE"] = 3] = "EDGE";
        EBrowser[EBrowser["MOZILLA"] = 4] = "MOZILLA";
        EBrowser[EBrowser["OPERA"] = 5] = "OPERA";
        EBrowser[EBrowser["UNKNOWN"] = 6] = "UNKNOWN";
    })(EBrowser = exports.EBrowser || (exports.EBrowser = {}));
    var EBrowserEngine;
    (function (EBrowserEngine) {
        EBrowserEngine[EBrowserEngine["WEBKIT"] = 0] = "WEBKIT";
        EBrowserEngine[EBrowserEngine["TRIDENT"] = 1] = "TRIDENT";
        EBrowserEngine[EBrowserEngine["GECKO"] = 2] = "GECKO";
        EBrowserEngine[EBrowserEngine["UNKNOWN"] = 3] = "UNKNOWN";
    })(EBrowserEngine = exports.EBrowserEngine || (exports.EBrowserEngine = {}));
    var EnvUtils = (function () {
        function EnvUtils() {
        }
        EnvUtils.initDetection = function () {
            if (!EnvUtils.__NEED_DETECTION)
                return;
            var browserSignature = navigator.userAgent.toLowerCase();
            if (/ipad|iphone|ipod/gi.test(browserSignature) && !window['MSStream']) {
                EnvUtils.__DEVICE_TYPE = EDeviceType.HANDHELD;
                EnvUtils.__PLATFORM = EPlatform.IOS;
            }
            else if (/android/gi.test(browserSignature)) {
                EnvUtils.__DEVICE_TYPE = EDeviceType.HANDHELD;
                EnvUtils.__PLATFORM = EPlatform.ANDROID;
            }
            else if (/mac/gi.test(browserSignature)) {
                EnvUtils.__DEVICE_TYPE = EDeviceType.DESKTOP;
                EnvUtils.__PLATFORM = EPlatform.MAC;
            }
            else if (/windows phone/gi.test(browserSignature)) {
                EnvUtils.__DEVICE_TYPE = EDeviceType.HANDHELD;
                EnvUtils.__PLATFORM = EPlatform.WINDOWS;
            }
            else if (/windows/gi.test(browserSignature)) {
                EnvUtils.__DEVICE_TYPE = EDeviceType.DESKTOP;
                EnvUtils.__PLATFORM = EPlatform.WINDOWS;
            }
            else {
                EnvUtils.__DEVICE_TYPE = EDeviceType.DESKTOP;
                EnvUtils.__PLATFORM = EPlatform.UNKNOWN;
            }
            if (/edge/gi.test(browserSignature)) {
                EnvUtils.__BROWSER = EBrowser.EDGE;
            }
            else if (/chrome/gi.test(browserSignature)) {
                EnvUtils.__BROWSER = EBrowser.CHROME;
            }
            else if (/safari/gi.test(browserSignature)) {
                EnvUtils.__BROWSER = EBrowser.SAFARI;
            }
            else if (/msie/gi.test(browserSignature) || ("ActiveXObject" in window)) {
                EnvUtils.__BROWSER = EBrowser.IE;
            }
            else if (/mozilla/gi.test(browserSignature)) {
                EnvUtils.__BROWSER = EBrowser.MOZILLA;
            }
            else if (/opera/gi.test(browserSignature)) {
                EnvUtils.__BROWSER = EBrowser.OPERA;
            }
            else {
                EnvUtils.__BROWSER = EBrowser.UNKNOWN;
            }
            if (/webkit/gi.test(browserSignature)) {
                EnvUtils.__BROWSER_ENGINE = EBrowserEngine.WEBKIT;
            }
            else if (/trident/gi.test(browserSignature)) {
                EnvUtils.__BROWSER_ENGINE = EBrowserEngine.TRIDENT;
            }
            else if (/gecko/gi.test(browserSignature)) {
                EnvUtils.__BROWSER_ENGINE = EBrowserEngine.GECKO;
            }
            else {
                EnvUtils.__BROWSER_ENGINE = EBrowserEngine.UNKNOWN;
            }
            EnvUtils.__CAPABILITIES = {
                retina: (("devicePixelRatio" in window) && window.devicePixelRatio >= 1.5),
                touch: ("ontouchstart" in document),
                audio: ("canPlayType" in document.createElement("audio")),
                video: ("canPlayType" in document.createElement("video")),
                pushState: ("history" in window && "pushState" in history),
                geolocation: ("geolocation" in navigator),
                webGL: (EnvUtils.isWebglAvailable())
            };
            EnvUtils.__NEED_DETECTION = false;
        };
        EnvUtils.isWebglAvailable = function () {
            try {
                var canvas = document.createElement("canvas");
                return !!(window["WebGLRenderingContext"] &&
                    (canvas.getContext("webgl") ||
                        canvas.getContext("experimental-webgl")));
            }
            catch (e) {
                return false;
            }
        };
        EnvUtils.getDeviceType = function () {
            EnvUtils.initDetection();
            return EnvUtils.__DEVICE_TYPE;
        };
        EnvUtils.isDeviceType = function (pDeviceType) {
            EnvUtils.initDetection();
            return EnvUtils.getDeviceType() == pDeviceType;
        };
        EnvUtils.getPlatform = function () {
            EnvUtils.initDetection();
            return EnvUtils.__PLATFORM;
        };
        EnvUtils.isPlatform = function (pPlatform) {
            EnvUtils.initDetection();
            return EnvUtils.getPlatform() == pPlatform;
        };
        EnvUtils.getBrowser = function () {
            EnvUtils.initDetection();
            return EnvUtils.__BROWSER;
        };
        EnvUtils.getIEVersion = function () {
            var myNav = navigator.userAgent.toLowerCase();
            return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1], 10) : Number.POSITIVE_INFINITY;
        };
        EnvUtils.getIOSVersion = function () {
            EnvUtils.initDetection();
            if (EnvUtils.__PLATFORM == EPlatform.IOS) {
                var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                if (v == null || v.length < 3)
                    return [Number.POSITIVE_INFINITY];
                return [
                    parseInt(v[1], 10),
                    parseInt(v[2], 10),
                    parseInt(v[3] || '0', 10)
                ];
            }
            else
                return [Number.POSITIVE_INFINITY];
        };
        EnvUtils.isBrowser = function (pBrowser) {
            EnvUtils.initDetection();
            return EnvUtils.getBrowser() == pBrowser;
        };
        EnvUtils.getBrowserEngine = function () {
            EnvUtils.initDetection();
            return EnvUtils.__BROWSER_ENGINE;
        };
        EnvUtils.isBrowserEngine = function (pBrowserEngine) {
            EnvUtils.initDetection();
            return EnvUtils.getBrowserEngine() == pBrowserEngine;
        };
        EnvUtils.getCapabilities = function () {
            EnvUtils.initDetection();
            return EnvUtils.__CAPABILITIES;
        };
        EnvUtils.log = function () {
            console.group("EnvUtils.log");
            console.log("deviceType", EnvUtils.getDeviceType());
            console.log("platform", EnvUtils.getPlatform());
            console.log("browser", EnvUtils.getBrowser());
            console.log("browserEngine", EnvUtils.getBrowserEngine());
            console.log("capabilities", EnvUtils.getCapabilities());
            console.groupEnd();
        };
        EnvUtils.addClasses = function (pToSelector, pPrefix) {
            if (pToSelector === void 0) { pToSelector = 'body'; }
            if (pPrefix === void 0) { pPrefix = ''; }
            EnvUtils.initDetection();
            $(function () {
                var $domRoot = $(pToSelector);
                $domRoot.addClass(pPrefix + 'is-' + StringUtils_1.StringUtils.snakeToCamelCase(EBrowser[EnvUtils.__BROWSER], '_'));
                $domRoot.addClass(pPrefix + 'is-' + StringUtils_1.StringUtils.snakeToCamelCase(EBrowserEngine[EnvUtils.__BROWSER_ENGINE], '_'));
                $domRoot.addClass(pPrefix + 'is-' + StringUtils_1.StringUtils.snakeToCamelCase(EDeviceType[EnvUtils.__DEVICE_TYPE], '_'));
                $domRoot.addClass(pPrefix + 'is-' + StringUtils_1.StringUtils.snakeToCamelCase(EPlatform[EnvUtils.__PLATFORM], '_'));
                for (var i in EnvUtils.__CAPABILITIES) {
                    EnvUtils.__CAPABILITIES[i] && $domRoot.addClass(pPrefix + 'has-' + i);
                }
            });
        };
        return EnvUtils;
    }());
    EnvUtils.__NEED_DETECTION = true;
    exports.EnvUtils = EnvUtils;
});


define('lib/solidify/utils/ModuleUtils', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/utils/ModuleUtils';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ModuleUtils = (function () {
        function ModuleUtils() {
        }
        ModuleUtils.getRegistryNames = function () {
            return ModuleUtils.REQUIRE.s.contexts['_'].registry;
        };
        ModuleUtils.getLoadedModulesNames = function () {
            return ModuleUtils.REQUIRE.s.contexts['_'].defined;
        };
        ModuleUtils.requireSync = function (pDependencyName) {
            return ModuleUtils.REQUIRE(pDependencyName);
        };
        ModuleUtils.requireAsync = function (pDependenciesNames, pHandler) {
            ModuleUtils.REQUIRE(pDependenciesNames, pHandler);
        };
        ModuleUtils.dynamicNew = function (pClassReference, pConstructorArguments) {
            function DynamicClass() {
                pClassReference.apply(this, pConstructorArguments);
            }
            DynamicClass.prototype = pClassReference.prototype;
            return new DynamicClass();
        };
        ModuleUtils.preloadModules = function (pModulesPath, pLoadedHandler) {
            var registry = this.getRegistryNames();
            var loadedModules = this.getLoadedModulesNames();
            var modulesToLoad = [];
            var totalLoadedModules = 0;
            for (var modulePathIndex in pModulesPath) {
                for (var moduleName in registry) {
                    if (moduleName.toLowerCase().indexOf(pModulesPath[modulePathIndex].toLowerCase()) != -1
                        &&
                            !(moduleName in loadedModules)) {
                        modulesToLoad.push(moduleName);
                        this.requireAsync([moduleName], function () {
                            totalLoadedModules++;
                            if (totalLoadedModules == modulesToLoad.length) {
                                pLoadedHandler(modulesToLoad);
                            }
                        });
                    }
                }
            }
            if (modulesToLoad.length == 0) {
                pLoadedHandler(modulesToLoad);
            }
        };
        return ModuleUtils;
    }());
    ModuleUtils.REQUIRE = window['requirejs'];
    exports.ModuleUtils = ModuleUtils;
});


define('lib/solidify/utils/StringUtils', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/utils/StringUtils';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StringUtils = (function () {
        function StringUtils() {
        }
        StringUtils.trailingSlash = function (pPath, pAdd) {
            if (pAdd === void 0) { pAdd = true; }
            var hasTrailingSlash = (pPath.lastIndexOf('/') == pPath.length - 1);
            if (pAdd && !hasTrailingSlash) {
                return pPath + '/';
            }
            else if (!pAdd && hasTrailingSlash) {
                return pPath.substr(0, pPath.length - 1);
            }
            else
                return pPath;
        };
        StringUtils.leadingSlash = function (pPath, pAdd) {
            if (pAdd === void 0) { pAdd = true; }
            var hasLeadingSlash = (pPath.indexOf('/') == 0);
            if (pAdd && !hasLeadingSlash) {
                return '/' + pPath;
            }
            else if (!pAdd && hasLeadingSlash) {
                return pPath.substr(1, pPath.length);
            }
            else
                return pPath;
        };
        StringUtils.upperCaseFirstChar = function (pSource) {
            return pSource.substr(0, 1).toUpperCase() + pSource.substr(1, pSource.length);
        };
        StringUtils.lowerCaseFirstChar = function (pSource) {
            return pSource.substr(0, 1).toLowerCase() + pSource.substr(1, pSource.length);
        };
        StringUtils.snakeToCamelCase = function (pSource, pSeparator) {
            if (pSeparator === void 0) { pSeparator = '-'; }
            var splitted = pSource.toLowerCase().split(pSeparator);
            var total = splitted.length;
            if (total < 2)
                return pSource.toLowerCase();
            var out = splitted[0];
            for (var i = 1; i < total; i++) {
                out += (i == 0 ? splitted[i] : StringUtils.upperCaseFirstChar(splitted[i]));
            }
            return out;
        };
        StringUtils.camelToSnakeCase = function (pSource, pSeparator, pUpperCase) {
            if (pSeparator === void 0) { pSeparator = '-'; }
            if (pUpperCase === void 0) { pUpperCase = false; }
            return pSource.replace(/([A-Z])/g, function (part) {
                return (pSeparator
                    + (pUpperCase
                        ? part.toUpperCase()
                        : part.toLowerCase()));
            });
        };
        StringUtils.enumToString = function (pEnumValue, pEnumClass, pCamelCase) {
            if (pCamelCase === void 0) { pCamelCase = true; }
            var enumStringValue = pEnumClass[pEnumValue];
            var enumSnakeValue = enumStringValue.toLowerCase().split('_').join('-');
            return pCamelCase ? StringUtils.snakeToCamelCase(enumSnakeValue) : enumSnakeValue;
        };
        StringUtils.stringToEnum = function (pString, pEnumClass) {
            var patchedString = pString.toUpperCase().split('-').join('_');
            var index = 0;
            do {
                if (pEnumClass[index] == patchedString) {
                    return index;
                }
                index++;
            } while (index in pEnumClass);
            return -1;
        };
        StringUtils.getFileFromPath = function (pPath) {
            var lastIndex = pPath.lastIndexOf('/');
            if (lastIndex == -1) {
                lastIndex = 0;
            }
            return pPath.substring(lastIndex + 1, pPath.length);
        };
        StringUtils.getBaseFromPath = function (pPath) {
            var lastIndex = pPath.lastIndexOf('/');
            if (lastIndex == -1) {
                lastIndex = pPath.length;
            }
            return pPath.substring(0, lastIndex);
        };
        StringUtils.extractPathFromBase = function (pPath, pBase) {
            var baseStartIndex = pPath.indexOf(pBase);
            return (baseStartIndex == 0
                ? pPath.substr(pBase.length, pPath.length)
                : pPath);
        };
        StringUtils.quickMustache = function (pTemplate, pValues) {
            return pTemplate.replace(/\{\{(.*?)\}\}/g, function (i, pMatch) {
                return pValues[pMatch];
            });
        };
        StringUtils.slugify = function (pInput) {
            var total = this.SLUG_REGEX.length;
            for (var i = 0; i < total; i++) {
                pInput = pInput.replace(this.SLUG_REGEX[i].regex, this.SLUG_REGEX[i].char);
            }
            return (pInput.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/\-{2,}/g, '-'));
        };
        StringUtils.parseQueryString = function (pQueryString) {
            var varSplitters = ['&', '='];
            var queryStarters = ['?', '#'];
            for (var j in queryStarters) {
                if (pQueryString.indexOf(queryStarters[j]) < pQueryString.indexOf(varSplitters[1])) {
                    pQueryString = pQueryString.substring(pQueryString.indexOf(queryStarters[j]) + 1, pQueryString.length);
                }
            }
            var queryParameters = pQueryString.split(varSplitters[0]);
            var params = {};
            var pair;
            for (var i = queryParameters.length - 1; i >= 0; i--) {
                pair = queryParameters[i].split(varSplitters[1]);
                if (pair[0].length == 0)
                    continue;
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
            return params;
        };
        return StringUtils;
    }());
    StringUtils.SLUG_REGEX = [{
            regex: /[\xC0-\xC6]/g,
            char: 'A'
        }, {
            regex: /[\xE0-\xE6]/g,
            char: 'a'
        }, {
            regex: /[\xC8-\xCB]/g,
            char: 'E'
        }, {
            regex: /[\xE8-\xEB]/g,
            char: 'e'
        }, {
            regex: /[\xCC-\xCF]/g,
            char: 'I'
        }, {
            regex: /[\xEC-\xEF]/g,
            char: 'i'
        }, {
            regex: /[\xD2-\xD6]/g,
            char: 'O'
        }, {
            regex: /[\xF2-\xF6]/g,
            char: 'o'
        }, {
            regex: /[\xD9-\xDC]/g,
            char: 'U'
        }, {
            regex: /[\xF9-\xFC]/g,
            char: 'u'
        }, {
            regex: /[\xC7-\xE7]/g,
            char: 'c'
        }, {
            regex: /[\xD1]/g,
            char: 'N'
        }, {
            regex: /[\xF1]/g,
            char: 'n'
        }
    ];
    exports.StringUtils = StringUtils;
});


