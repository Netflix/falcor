var getValueSync = require('falcor/get/getValueSync');
module.exports = function getBoundValue(model, path) {
    var boxed, value, shorted, found;

    boxed = model._boxed;
    model._boxed = true;
    value = getValueSync(model, path.concat(null));
    model._boxed = boxed;
    path = value.optimizedPath;
    shorted = value.shorted;
    found = value.found;
    value = value.value;
    while (path.length && path[path.length - 1] === null) {
        path.pop();
    }

    return {
        path: path,
        value: value,
        shorted: shorted,
        found: found
    };
};

