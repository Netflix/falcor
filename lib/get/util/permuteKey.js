var prefix = require("../../internal/prefix");
module.exports = function permuteKey(key, memo) {
    if (memo.isArray) {
        if (memo.loaded && memo.rangeOffset > memo.to) {
            memo.arrOffset++;
            memo.loaded = false;
        }

        var idx = memo.arrOffset, length = key.length;
        if (idx === length) {
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
            do  {
                if (type !== 'string') {
                    break;
                }

                if (el[0] !== prefix && el[0] !== '$') {
                    break;
                }

                el = key[++idx];
            } while (el === undefined || idx < length);

            if (el === undefined || idx === length) {
                memo.done = true;
                return '';
            }

            memo.arrOffset = idx + 1;
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
};

