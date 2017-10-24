define(["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RandomComponent = (function (_super) {
        __extends(RandomComponent, _super);
        function RandomComponent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RandomComponent.prototype.render = function () {
            return React.createElement("div", null, "Coucou !");
        };
        return RandomComponent;
    }(React.Component));
    exports.RandomComponent = RandomComponent;
});
