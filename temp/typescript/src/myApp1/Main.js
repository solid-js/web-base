define(["require", "exports", "react-dom", "three", "../../lib/solidify/utils/StringUtils"], function (require, exports, ReactDOM, THREE, StringUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = (function () {
        function Main() {
            console.log('TEST ! ');
            console.log(ReactDOM.findDOMNode);
            var slugified = StringUtils_1.StringUtils.slugify('héhé !');
            console.log(slugified);
            var renderer = new THREE.WebGLRenderer();
            console.log(renderer);
        }
        return Main;
    }());
    exports.Main = Main;
});
