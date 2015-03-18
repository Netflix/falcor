function getBoundPath(model, path, value, boxed) {
    model || (model = this);
    path  || (path  = model._path || []);
    if(path.length > 0) {
        model._boxed  = (boxed = model._boxed) || true;
        value = getPath(model, path);
        model._boxed  = boxed;
    } else {
        value = { path: path, value: model._cache };
    }
    return value;
}
