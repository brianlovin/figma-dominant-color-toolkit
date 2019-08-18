"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mmcq_1 = require("../mmcq");
self.onmessage = function (event) {
    var data = event.data;
    var id = data.id, payload = data.payload;
    var response;
    try {
        var swatches = mmcq_1.default(payload.pixels, payload.opts);
        response = {
            id: id,
            type: 'return',
            payload: swatches
        };
    }
    catch (e) {
        response = {
            id: id,
            type: 'error',
            payload: e.message
        };
    }
    self.postMessage(response);
};
//# sourceMappingURL=worker.js.map