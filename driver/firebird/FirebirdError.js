"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var FirebirdError = /** @class */ (function (_super) {
    tslib_1.__extends(FirebirdError, _super);
    function FirebirdError(erro) {
        var _this = _super.call(this) || this;
        _this.message = "Firebird error: " + erro;
        return _this;
    }
    return FirebirdError;
}(Error));
exports.FirebirdError = FirebirdError;

//# sourceMappingURL=FirebirdError.js.map
