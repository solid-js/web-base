define(["require", "exports", "react", "react-dom", "../common/components/randomComponent/RandomComponent", "../myApp1/components/myApp1Component/MyApp1Component"], function (require, exports, React, ReactDOM, RandomComponent_1, MyApp1Component_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var TweenLite = gsap.TweenLite;
    var Power4 = gsap.Power4;
    var Main = (function () {
        function Main() {
            ReactDOM.render(React.createElement(RandomComponent_1.RandomComponent, null), $('.AppContainer')[0]);
            var jquery = $('.test');
            var test = new MyApp1Component_1.MyApp1Component();
            var point = new PIXI.Point(10, 20);
            TweenLite.to(point, .3, {
                x: 0,
                y: 30,
                ease: Power4.easeOut,
                onUpdate: function () {
                    console.log(point);
                }
            });
        }
        return Main;
    }());
    exports.Main = Main;
});
