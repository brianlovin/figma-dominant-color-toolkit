"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pool_1 = require("./worker/pool");
var quantizeInWorker = function (pixels, opts) {
    return pool_1.default.instance.quantize(pixels, opts);
};
exports.default = quantizeInWorker;
//# sourceMappingURL=worker.js.map