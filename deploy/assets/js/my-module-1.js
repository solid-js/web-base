"use strict";

this["TemplateFiles"] = this["TemplateFiles"] || {};

this["TemplateFiles"]["../src/myModule1/components/testComponent/TestComponent.hbs"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
var JsonFiles = JsonFiles || {};
define('src/myModule1/Main', ["require", "exports", 'lib/solidify/helpers/Signal'], function (require, exports, Signal_1) {

    var __FILE = 'src/myModule1/Main';
    var Main = (function () {
        function Main() {
            console.log('OK module 1');
            var signal = new Signal_1.Signal();
            signal.add(this, this.testSignal);
            signal.dispatch('test');
        }
        Main.prototype.testSignal = function () {
            var rest = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                rest[_i - 0] = arguments[_i];
            }
            console.warn('TEST SIGNAL', rest);
        };
        return Main;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Main;
});


define('src/myModule1/components/testComponent/TestComponent', ["require", "exports"], function (require, exports) {

    var __FILE = 'src/myModule1/components/testComponent/TestComponent';
    var TestComponent = (function () {
        function TestComponent() {
        }
        return TestComponent;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TestComponent;
});


