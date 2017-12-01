define(["require", "exports", "react-dom", "three", "solidify-lib/utils/StringUtils"], function (require, exports, ReactDOM, THREE, StringUtils_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = (function () {
        function Main() {
            console.log('TEST ! ');
            console.log(ReactDOM.findDOMNode);
            var slugified = StringUtils_1.StringUtils.slugify('héhé !');
            console.log(slugified);
            var renderer = new THREE.WebGLRenderer();
            console.log(renderer);
            console.log(__atoms);
        }
        return Main;
    }());
    exports.Main = Main;
});
