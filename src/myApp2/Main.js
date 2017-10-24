"use strict";
exports.__esModule = true;
var React = require("react");
var ReactDOM = require("react-dom");
var RandomComponent_1 = require("../common/components/randomComponent/RandomComponent");
var MyApp1Component_1 = require("../myApp1/components/myApp1Component/MyApp1Component");
var Main = /** @class */ (function () {
    function Main() {
        ReactDOM.render(<RandomComponent_1.RandomComponent />, document.getElementById('root'));
        var test = new MyApp1Component_1.MyApp1Component();
    }
    return Main;
}());
exports.Main = Main;
