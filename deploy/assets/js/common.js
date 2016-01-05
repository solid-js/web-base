"use strict";

var JsonFiles = JsonFiles || {};
define('lib/solidify/helpers/Signal', ["require", "exports"], function (require, exports) {

    var __FILE = 'lib/solidify/helpers/Signal';
    var Signal = (function () {
        function Signal() {
            this._id = 0;
            this._listeners = [];
        }
        Object.defineProperty(Signal.prototype, "length", {
            get: function () {
                return this._listeners.length;
            },
            enumerable: true,
            configurable: true
        });
        Signal.prototype.add = function (pScope, pHandler) {
            return this.register(pScope, pHandler, false);
        };
        Signal.prototype.addOnce = function (pScope, pHandler) {
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
                rest[_i - 0] = arguments[_i];
            }
            var results = [];
            var currentListener;
            var currentResult;
            var listenersToRemove = [];
            for (var listenerIndex in this._listeners) {
                currentListener = this._listeners[listenerIndex];
                currentResult = currentListener.handler.apply(currentListener.scope, rest);
                if (currentResult != null && currentResult != undefined) {
                    results.push(currentResult);
                }
                if (currentListener.once) {
                    listenersToRemove.push(currentListener);
                }
            }
            for (listenerIndex in listenersToRemove) {
                this.remove(listenersToRemove[listenerIndex].handler);
            }
            return results;
        };
        Signal.prototype.remove = function (pHandlerId) {
            var newListeners = [];
            var currentListener;
            var listenerDeleted = false;
            for (var i in this._listeners) {
                currentListener = this._listeners[i];
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
        };
        return Signal;
    })();
    exports.Signal = Signal;
});


