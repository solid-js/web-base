define(["require", "exports", "react", "react-dom", "../common/components/randomComponent/RandomComponent", "../myApp1/components/myApp1Component/MyApp1Component"], function (require, exports, React, ReactDOM, RandomComponent_1, MyApp1Component_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = (function () {
        function Main() {
            ReactDOM.render(React.createElement(RandomComponent_1.RandomComponent, null), $('.AppContainer')[0]);
            var test = new MyApp1Component_1.MyApp1Component();
        }
        return Main;
    }());
    exports.Main = Main;
});
