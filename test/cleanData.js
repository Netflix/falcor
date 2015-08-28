var __key = require("../lib/internal/key");

module.exports = {
    clean: clean,
    strip: strip,
    traverseAndConvert: traverseAndConvert
};

function clean(item, options) {
    traverseAndConvert(item);
    strip(item, __key);

    options = options || { strip: ['$size'] };
    options.strip.forEach(function(s) {
        strip(item, s);
    });
    return item;
}


function traverseAndConvert(obj) {
    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            if (typeof obj[i] === "object") {
                traverseAndConvert(obj[i]);
            } else if (typeof obj[i] === "number") {
                obj[i] = obj[i] + "";
            } else if(typeof obj[i] === "undefined") {
                obj[i] = null;
            }
        }
    } else if (obj != null && typeof obj === "object") {
        Object.keys(obj).forEach(function(k) {
            if (typeof obj[k] === "object") {
                traverseAndConvert(obj[k]);
            } else if (typeof obj[k] === "number") {
                obj[k] = obj[k] + "";
            } else if(typeof obj[k] === "undefined") {
                obj[k] = null;
            }
        });
    }
    return obj;
}

function strip(obj, key) {
    var keys = Array.prototype.slice.call(arguments, 1);
    var args = [0].concat(keys);
    if (obj != null && typeof obj === "object") {
        Object.keys(obj).forEach(function(k) {
            if (~keys.indexOf(k)) {
                delete obj[k];
            } else if ((args[0] = obj[k]) != null && typeof obj[k] === "object") {
                strip.apply(null, args);
            }
        });
    }
}
