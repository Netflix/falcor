var Promise = require('promise');
module.exports = {
    get: function(titleIds) {
        return new Promise(function(cb) {
            cb(titleIds.map(function(id) {
                return data[id];
            }));
        });
    }
};

var data = {
    956: {
        id: 956,
        name: 'Dare Devil',
        boxShot: 'http://cdn6.nflximg.net/webp/5516/20935516.webp'
    },
    1234: {
        id: 1234,
        name: 'House of Cards',
        boxShot: 'http://cdn5.nflximg.net/webp/8265/13038265.webp'
    },
    333: {
        id: 333,
        name: 'Unbreakable Kimmy Schmidt',
        boxShot: 'http://cdn8.nflximg.net/webp/4318/12154318.webp'
    }
};
