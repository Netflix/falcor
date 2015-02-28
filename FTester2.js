var FModel = function(cache) {
    this._cache = cache;
    this._boxed = false;
    this._root = {size: 0};
};

FModel.prototype = {
    _getPathsAsValues: _getPathsAsValues
};

function now() {
    return Date.now();
}

function _getPathsAsValues(model, paths, onNext) {
    var result = {
        values: [],
        errors: [],
        requestedPaths: [],
        optimizedPaths: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: []
    };

    paths.forEach(function(p) {
        walk(model, model._cache, model._cache, p, 0, onNext, result, [], []);
    });

    return result;
}

function permuteKey(key, memo) {
    if (memo.done) {
        return;
    }

}

// TODO: Objectify?
function walk(model, root, node, path, depth, onNext, result, optimizedPath, requestedPath) {
    var k = path[depth];
    var key;
    var permuteRequested = requestedPath;
    var permuteOptimized = optimizedPath;
    var isComplex = typeof k === 'object' && k !== null;
    var done = false, from, to, rangeOffset, arrayOffset = 0, loaded = false, isArray = isComplex && Array.isArray(k);
    var type, idx, el;
    depth++;

    while (!done) {
        // ComboLock
        if (isArray) {
            if (loaded && rangeOffset > to) {
                arrayOffset++;
                loaded = false;
            }

            idx = arrayOffset;
            if (idx === k.length) {
                break;
            }

            el = k[arrayOffset];
            type = typeof el;
            if (type === 'object') {
                if (!loaded) {
                    from = el.from || 0;
                    to = el.to || el.length && from + el.length - 1 || 0;
                    rangeOffset = from;
                    loaded = true;
                }


                key = rangeOffset++;
            } else {
                arrayOffset++;
                key = el;
            }
        } else if (isComplex) {
            if (!loaded) {
                from = k.from || 0;
                to = k.to || k.length && from + k.length - 1 || 0;
                rangeOffset = from;
                loaded = true;
            }
            
            if (rangeOffset > to) {
                break;
            }

            key = rangeOffset++;
        } else {
            key = k;
            done = true;
        }

        if (!done) {
            //must copy everytime.
            permuteOptimized = [];
            permuteRequested = [];
            for (var i = 0, len = requestedPath.length; i < len; i++) {
                permuteRequested[i] = requestedPath[i];
            }
            for (var i = 0, len = optimizedPath.length; i < len; i++) {
                permuteOptimized[i] = optimizedPath[i];
            }
        }

        var nodeIsSentinel = node.$type === 'sentinel';
        var next = nodeIsSentinel ? node.value[key] : node[key];
        var pV;

        if (next) {
            var nType = next.$type;
            var value = nType === 'sentinel' ? next.value : next;
            var valueIsArray = Array.isArray(value);


            permuteOptimized.push(key);
            permuteRequested.push(key);

            if (isExpired(next)) {
                result.requestedMissingPaths.push(permuteRequested.concat(path.slice(depth)));
                result.optimizedMissingPaths.push(permuteOptimized.concat(path.slice(depth)));
            }

            else if (depth < path.length) {

                if (valueIsArray) {
                    var ref = followReference(model, root, root, value);
                    var refNode = ref[0];
                    copyInto(permuteOptimized, ref[1]);

                    if (refNode) {
                        var rType = refNode.$type;
                        var rValue = rType === 'sentinel' ? refNode.value : refNode;

                        // short circuit case
                        if (rType === 'leaf') {
                            updateTrailingNullCase(path, depth, permuteRequested);
                            lruPromote(model, refNode);
                            pV = createPathValueAndUpdateResults(model, refNode, permuteRequested, permuteOptimized, result);
                            onNext && onNext(pV);
                        }

                        else if (rType === 'error') {
                            result.errors.push({path: permuteRequested, value: readyPathValue(rValue)});
                            updateTrailingNullCase(path, depth, permuteRequested);
                            lruPromote(model, refNode);
                            result.requestedPaths.push(permuteRequested);
                            result.optimizedPaths.push(permuteOptimized);
                        }

                        else {
                            walk(model, root, refNode, path, depth, onNext, result, permuteOptimized, permuteRequested);
                        }
                    } else {
                        result.requestedMissingPaths.push(permuteRequested.concat(path.slice(depth)));
                        result.optimizedMissingPaths.push(permuteOptimized.concat(path.slice(depth)));
                    }
                }

                else if (nType === 'error') {
                    result.errors.push({path: permuteRequested, value: readyPathValue(value)});
                    updateTrailingNullCase(path, depth, permuteRequested);
                    lruPromote(model, next);
                    result.requestedPaths.push(permuteRequested);
                    result.optimizedPaths.push(permuteOptimized);
                }

                else if (nType === 'leaf') {
                    updateTrailingNullCase(path, depth, permuteRequested);
                    pV = createPathValueAndUpdateResults(model, next, permuteRequested, permuteOptimized, result);
                    lruPromote(model, next);
                    onNext && onNext(pV);
                }

                else {
                    walk(model, root, value, path, depth, onNext, result, permuteOptimized, permuteRequested);
                }
            }

            // we are the last depth.  This needs to be returned
            else {
                if (nType || valueIsArray) {
                    pV = createPathValueAndUpdateResults(model, next, permuteRequested, permuteOptimized, result);
                    lruPromote(model, next);
                    onNext && onNext(pV);
                } else {
                    result.requestedMissingPaths.push(permuteRequested.concat(path.slice(depth)));
                    result.optimizedMissingPaths.push(permuteOptimized.concat(path.slice(depth)));
                }
            }
        } else {
            result.requestedMissingPaths.push(permuteRequested.concat(path.slice(depth - 1)));
            result.optimizedMissingPaths.push(permuteOptimized.concat(path.slice(depth - 1)));
        }
    }
}

function updateTrailingNullCase(path, depth, requested) {
    if (path[depth] === null && depth === path.length - 1) {
        requested.push(null);
    }
}

function isExpired(node) {
    var $expires = node.$expires === undefined && -1 || node.$expires;
    return $expires !== -1 && $expires !== 1 && ($expires === 0 || $expires < now());
}

// TODO: Objectify?
function createPathValueAndUpdateResults(model, node, requestedPath, optimizedPath, results) {
    var pathValue = cloneToPathValue(model, node, requestedPath);
    results.values.push(pathValue);
    results.requestedPaths.push(requestedPath);
    results.optimizedPaths.push(optimizedPath);

    return pathValue;
}

function cloneToPathValue(model, node, path) {
    var type = node.$type;
    var value = type === 'sentinel' ? node.value : node;
    var outValue;

    if (model._boxed) {
        outValue = value;
    } else {
        outValue = readyPathValue(value);
    }

    return {path: path, value: outValue};
}

function lruPromote(model, object) {
    var root = model._root;
    var head = root.head;
    if (head === object) { 
        return;
    }
    
    // First insert
    if (!head) {
        root.head = object;
        return;
    }
    
    // The head and the tail need to separate
    if (!root.tail) {
        root.head = object;
        root.tail = head;
        object.__prev = head;
        head.__next = object;
        return;
    }
    
    // Its in the cache.
    var prev = object.__prev;
    var next = object.__next;
    if (prev || next) {
        if (next && prev) {
            prev.__next = next;
            next.__prev = prev;
        } else if (next) {
            next.__prev = undefined;
        } else if (prev) {
            prev.__next = undefined;
        }
        object.__next = undefined;
    } else {
        root.size++;
    }
    
    // Insert into head position
    root.head = object;
    object.__prev = head;
    head.__next = object;
}

function lruRemove(model, parent, key) {
//    var sentinel = parent.$type === 'sentinel';
//    var object;
//
//    if (sentinel) {
//        object = parent.value[key];
//        parent.value[key] = undefined;
//    } else {
//        object = parent[key];
//        parent[key] = undefined;
//    }
//
//    var root = model._root;
//    var size = --root.size;
//
//    // last remove
//    if (size === 0) {
//        root.head = root.tail = false;
//    }
//
//    else if (root.size === 1) {
//        root.head = root.tail = false;
//        return;
//    }
//
//    else if (root.size === 2) {
//        root.tail = root.head;
//        root.head.__prev = undefined;
//        return;
//    }
//
//    var prev = object.__prev;
//    var next = object.__next;
//    if (next && prev) {
//        prev.__next = next;
//        next.__prev = prev;
//    } else if (next) {
//        next.__prev = undefined;
//    }

    // removes all references to the object.
//    Object.
//        keys(object).
//        forEach(function(k) {
//            object[k] = null;
//        });
}

function readyPathValue(value) {
    var outValue;
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            outValue = [];
            copyInto(outValue, value);
        } else {
            outValue = Object.
                keys(value).
                filter(function(k) {
                    return !isIntenalKey(k);
                }).
                reduce(function(acc, x) {
                    acc[x] = value[x];
                    return acc;
                }, {});
        }
    } else {
        outValue = value;
    }
    return outValue;
}

function followReference(model, root, node, reference) {

    var depth = 0;
    while (true) {
        var k = reference[depth++];
        var next = node[k];

        if (next) {
            var type = next.$type;
            var value = type === 'sentinel' ? next.value : next;

            if (depth < reference.length) {
                if (type) {
                    break;
                }
                if (isExpired(next)) {
                    break;
                }

                node = next;
                continue;
            }

            else if (depth === reference.length) {

                // hit expired branch
                if (isExpired(next)) {
                    break;
                }

                // Restart the reference follower.
                if (Array.isArray(value)) {
                    depth = 0;
                    reference = value;
                    node = root;
                    continue;
                }

                node = next;
                break;
            }
        }
        break;
    }

    return [node, reference];
}

function isIntenalKey(x) {
    return x.indexOf('__') === 0 || x.indexOf('$') === 0;
}

function copyInto(a1, a2) {
    a1.length = a2.length;
    for (var i = 0, len = a2.length; i < len; i++) {
        a1[i] = a2[i];
    }
}

if (typeof module !== 'undefined') {
    module.exports = FModel;
    if (require.main === module) {
        var Cache = require('./test/data/Cache');
        var model = new FModel(Cache());

        var results = model._getPathsAsValues(model, [['genreList', 0, 0, 'summary']], function(x) {
            debugger;
        });
        debugger;
    }
}
