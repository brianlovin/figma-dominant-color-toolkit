"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function defaultFilter(r, g, b, a) {
    return a >= 125 &&
        !(r > 250 && g > 250 && b > 250);
}
exports.default = defaultFilter;
//# sourceMappingURL=default.js.map