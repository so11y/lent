"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJsFlieRequest = void 0;
const isJsFlieRequest = (s) => {
    return s.url.endsWith(".js");
};
exports.isJsFlieRequest = isJsFlieRequest;
