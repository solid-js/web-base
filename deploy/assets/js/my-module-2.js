"use strict";

var JsonFiles = JsonFiles || {};
define('src/myModule2/Main', ["require", "exports"], function (require, exports) {

    var __FILE = 'src/myModule2/Main';
    var Main = (function () {
        function Main() {
            console.log('OK module 2');
        }
        return Main;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Main;
});


