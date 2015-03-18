function updateTrailingNullCase(path, depth, requested) {
    if (Array.isArray(path)) {
        if (path[depth] === null && depth === path.length - 1) {
            requested.push(null);
        }
    } else if (path !== null) {
        var keys = Object.keys(path);
        if (keys[0] === '__null' && keys.length === 1) {
            requested.push(null);
        }
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

function spreadJSON(root, bins, bin) {
    bin = bin || [];
    if (!bins.length) {
        bins.push(bin);
    }
    if (root == null || typeof root !== 'object') {
        return [];
    }
    var keys = Object.keys(root);
    if (keys.length === 1) {
        bin.push(keys[0]);
        spreadJSON(root[keys[0]], bins, bin);
    } else {
        for (var i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];
            var nextBin = fastCopy(bin);
            nextBin.push(k);
            bins.push(nextBin);
            spreadJSON(root[k], bins, nextBin);
        }
    }
}

module.exports = {
    spreadJSON: spreadJSON,
    permuteKey: permuteKey,
    fastCat: fastCat,
    fastCatSkipNulls: fastCatSkipNulls,
    fastCopy: fastCopy,
    isExpired: isExpired,
    updateTrailingNullCase: updateTrailingNullCase
};
