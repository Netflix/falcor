
function isIntenalKey(x) {
    return x.indexOf('__') === 0 || x.indexOf('$') === 0;
}

function copyInto(a1, a2) {
    a1.length = a2.length;
    for (var i = 0, len = a2.length; i < len; i++) {
        a1[i] = a2[i];
    }
}

function copyCacheObject(value, allowType, onto) {
    var type = value.$type;
    
    if (type === 'sentinel') {
        value = value.value;
    }
    
    var outValue;
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            outValue = [];
            copyInto(outValue, value);
        } else {
            var keys = Object.keys(value);
            outValue = onto || {};
            for (var i = 0, len = keys.length; i < len; i++) {
                var k = keys[i];
                if (!(k.indexOf('__') === 0 || k.indexOf('$') === 0)) {
                    outValue[k] = value[k];
                }
            }
            if (allowType) { 
                if (type && type !== 'sentinel') {
                    outValue.$type = type;
                } else {
                    outValue.$type = 'leaf';
                }
            }
        }
    } else {
        outValue = value;
    }
    return outValue;
}


function cloneToPathValue(model, node, path) {
    var type = node.$type;
    var value = type === 'sentinel' ? node.value : node;
    var outValue;

    if (model._boxed) {
        outValue = value;
    } else {
        outValue = copyCacheObject(value);
    }

    return {path: fastCopy(path), value: outValue};
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

function fastCopy(arr, i) {
    var a = [], len, j;
    for (j = 0, i = i || 0, len = arr.length; i < len; j++, i++) {
        a[j] = arr[i];
    }
    return a;
}

function fastCatSkipNulls(arr1, arr2) {
    var a = [];
    for (var i = 0, len = arr1.length; i < len; i++) {
        a[i] = arr1[i];
    }
    for (var j = 0, len = arr2.length; j < len; j++) {
        if (arr2[j]) {
            a[i++] = arr2[j];
        }
    }
    return a;
}

function fastCat(arr1, arr2) {
    var a = [];
    for (var i = 0, len = arr1.length; i < len; i++) {
        a[i] = arr1[i];
    }
    for (var j = 0, len = arr2.length; j < len; j++) {
        a[i++] = arr2[j];
    }
    return a;
}

function permuteKey(key, memo) {
    if (memo.done) {
        return;
    }

    if (memo.isArray) {
        if (memo.loaded && memo.rangeOffset > memo.to) {
            memo.arrOffset++;
            memo.loaded = false;
        }

        var idx = memo.arrOffset;
        if (idx === key.length) {
            memo.done = true;
            return '';
        }

        var el = key[memo.arrOffset];
        var type = typeof el;
        if (type === 'object') {
            if (!memo.loaded) {
                memo.from = el.from || 0;
                memo.to = el.to || el.length && memo.from + el.length - 1 || 0;
                memo.rangeOffset = memo.from;
                memo.loaded = true;
            }


            return memo.rangeOffset++;
        } else {
            memo.arrOffset++;
            return el;
        }
    } else {
        if (!memo.loaded) {
            memo.from = key.from || 0;
            memo.to = key.to || key.length && memo.from + key.length - 1 || 0;
            memo.rangeOffset = memo.from;
            memo.loaded = true;
        }
        if (memo.rangeOffset > memo.to) {
            memo.done = true;
            return '';
        }

        return memo.rangeOffset++;
    }
}
//    var done = false, from, to, rangeOffset, arrayOffset = 0, loaded = false, isArray = isComplex && Array.isArray(k);
//    var type, idx, el;
//    while (!done) {
//        // ComboLock
//        if (isArray) {
//            if (loaded && rangeOffset > to) {
//                arrayOffset++;
//                loaded = false;
//            }
//
//            idx = arrayOffset;
//            if (idx === k.length) {
//                break;
//            }
//
//            el = k[arrayOffset];
//            type = typeof el;
//            if (type === 'object') {
//                if (!loaded) {
//                    from = el.from || 0;
//                    to = el.to || el.length && from + el.length - 1 || 0;
//                    rangeOffset = from;
//                    loaded = true;
//                }
//
//
//                key = rangeOffset++;
//            } else {
//                arrayOffset++;
//                key = el;
//            }
//        } else if (isComplex) {
//            if (!loaded) {
//                from = k.from || 0;
//                to = k.to || k.length && from + k.length - 1 || 0;
//                rangeOffset = from;
//                loaded = true;
//            }
//
//            if (rangeOffset > to) {
//                break;
//            }
//
//            key = rangeOffset++;
//        } else {
//            key = k;
//            done = true;
//        }

