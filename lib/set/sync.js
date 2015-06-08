var $error = require("falcor/types/error");
var pathSyntax = require('falcor-path-syntax');
var get_type = require("falcor/support/get-type");
var is_object = require("falcor/support/is-object");
var is_path_value = require("falcor/support/is-path-value");
var set_json_values_as_json_dense = require("falcor/set/set-json-values-as-json-dense");

module.exports = function setValueSync(path, value, errorSelector, comparator) {

    path = pathSyntax.fromPath(path);

    if(is_path_value(path)) {
        comparator = errorSelector;
        errorSelector = value;
        value = path;
    } else {
        value = { path: path, value: value };
    }

    if(is_path_value(value) === false) {
        throw new Error("Model#setValueSync must be called with an Array path.");
    }

    if(typeof errorSelector !== "function") {
        errorSelector = this._errorSelector;
    }

    if(typeof comparator !== "function") {
        comparator = this._comparator;
    }

    if(this.syncCheck("setValueSync")) {

        var json = {};
        var boxed = this._boxed;
        var treatErrorsAsValues = this._treatErrorsAsValues;

        this._boxed = true;
        this._treatErrorsAsValues = true;

        set_json_values_as_json_dense(this, [value], [json], errorSelector, comparator);

        this._boxed = boxed;
        this._treatErrorsAsValues = treatErrorsAsValues;

        json = json.json;

        if(is_object(json) === false) {
            return json;
        } else if(treatErrorsAsValues || get_type(json) !== $error) {
            if(boxed) {
                return json;
            } else {
                return json.value;
            }
        } else if(boxed) {
            throw json;
        } else {
            throw json.value;
        }
    }
};