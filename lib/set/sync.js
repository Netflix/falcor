var $error = require("./../types/error");
var pathSyntax = require("falcor-path-syntax");
var getType = require("./../support/get-type");
var isObject = require("./../support/is-object");
var isPathValue = require("./../support/is-path-value");
var setJsonValuesAsJsonDense = require("./../set/set-json-values-as-json-dense");

module.exports = function setValueSync(pathArg, valueArg, errorSelectorArg, comparatorArg) {

    var path = pathSyntax.fromPath(pathArg);
    var value = valueArg;
    var errorSelector = errorSelectorArg;
    var comparator = comparatorArg;

    if (isPathValue(path)) {
        comparator = errorSelector;
        errorSelector = value;
        value = path;
    } else {
        value = {
            path: path,
            value: value
        };
    }

    if (isPathValue(value) === false) {
        throw new Error("Model#setValueSync must be called with an Array path.");
    }

    if (typeof errorSelector !== "function") {
        errorSelector = this._root._errorSelector;
    }

    if (typeof comparator !== "function") {
        comparator = this._root._comparator;
    }

    if (this._syncCheck("setValueSync")) {

        var json = {};
        var boxed = this._boxed;
        var treatErrorsAsValues = this._treatErrorsAsValues;

        this._boxed = true;
        this._treatErrorsAsValues = true;

        setJsonValuesAsJsonDense(this, [value], [json], errorSelector, comparator);

        this._boxed = boxed;
        this._treatErrorsAsValues = treatErrorsAsValues;

        json = json.json;

        if (isObject(json) === false) {
            return json;
        } else if (treatErrorsAsValues || getType(json) !== $error) {
            if (boxed) {
                return json;
            } else {
                return json.value;
            }
        } else if (boxed) {
            throw json;
        } else {
            throw json.value;
        }
    }
};
