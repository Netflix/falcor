var getValueSync = require('./getValueSync');
module.exports = function getBoundValue(model, path, value, boxed, shorted) {
    if (!model) {
        model = this;
    }
    if (!path) {
        path = model._path || [];
    }
    
    if (path.length) {
        boxed = model._boxed;
        model._boxed = true;
        value = getValueSync(model, path.concat(null));
        model._boxed = boxed;
        path = value.optimizedPath;
        shorted = value.shorted;
        value = value.value;
        while (path[path.length - 1] == null) {
            path.pop();
        }
    } else {
        value = model._cache;
        shorted = false;
    }
    return {
        path: path,
        value: value,
        shorted: shorted
    };
};

