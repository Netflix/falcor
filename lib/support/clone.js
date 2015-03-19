module.exports = function(value) {
    var dest = value, src = dest, i = -1, n, key;
    if(dest != null && typeof dest === "object") {
        if(Array.isArray(src)) {
            dest = new Array(n = src.length);
            while(++i < n) { dest[i] = src[i]; }
        } else {
            dest = Object.create(null);
            for(key in src) {
                if((key[0] !== "_" || key[1] !== "_") && (key !== "/" && key !== "./" && key !== "../")) {
                    dest[key] = src[key];
                }
            }
        }
    }
    return dest;
}