var getValueSync = require('./getValueSync');
module.exports = function getBoundValue(model, path) {
    var boxed, value, shorted;

    boxed = model._boxed;
    model._boxed = true;
    value = getValueSync(model, path.concat(null));
    model._boxed = boxed;
    path = value.optimizedPath;
    shorted = value.shorted;
    value = value.value;
    while (path.length && path[path.length - 1] === null) {
        path.pop();
    }

    return {
        path: path,
        value: value,
        shorted: shorted
    };
};

