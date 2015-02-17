function getBoundValue(model, path, value, boxed, shorted) {
    
    model || (model = this);
    path  || (path  = model._path || []);
    
    if(path.length) {
        model._boxed  = (boxed = model._boxed) || true;
        value = getValueSync(model, path.concat(null));
        model._boxed  = boxed;
        path = value.path;
        shorted = value.shorted;
        value = value.value;
        while(path[path.length - 1] == null) { path.pop(); }
    } else {
        value = model._cache;
        shorted = false;
    }
    
    return { path: path, value: value, shorted: shorted };
}
