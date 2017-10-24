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
define('src/myApp1/Main', ["require", "exports", "../../lib/solidify/core/App", "../../lib/solidify/core/Config", "../../lib/solidify/navigation/Router"], function (require, exports, App_1, Config_1, Router_1) {

    var __FILE = 'src/myApp1/Main';
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Main.prototype.initConfig = function () {
            Config_1.Config.instance.inject(JsonFiles['src/common/config/App']);
        };
        Main.prototype.initModules = function () {
            this._dependencyManager.registerModulePath('component', 'src/common/components/');
            this._dependencyManager.registerModulePath('component', 'src/myModule1/components/');
            this._dependencyManager.registerModulePath('page', 'src/myModule1/pages/');
            console.log('>', this._dependencyManager.getFlatModulesPath());
        };
        Main.prototype.initDependencies = function () {
            this._dependencyManager.registerInstance('myModule1', this);
        };
        Main.prototype.initAppView = function () {
        };
        Main.prototype.initRoutes = function () {
            var router = new Router_1.Router(this._params.base, [
                {
                    url: '/',
                    page: 'HomePage'
                },
                {
                    url: '/products/',
                    page: 'ProductPage',
                    action: 'overview'
                },
                {
                    url: '/products/{id}.html',
                    page: 'ProductPage',
                    action: 'product'
                }
            ]);
            router.listenLinks();
        };
        Main.prototype.ready = function () {
            Router_1.Router.instance.start();
        };
        return Main;
    }(App_1.App));
    exports.Main = Main;
});


