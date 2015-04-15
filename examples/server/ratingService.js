var Promise = require('promise');
module.exports = {
    get: function(titleIds) {
        return new Promise(function(cb) {
            cb(titleIds.map(function(id) {
                return data[id];
            }));
        });
    },
    set: function(titleIds, rating) {
        return new Promise(function(cb) {
            cb(titleIds.map(function(id) {
                data[id].rating = rating;
                return data[id];
            }));
        });
    }
};

var data = {
    956: {
        id: 956,
        rating: 4
    },
    1234: {
        id: 1234,
        rating: 4
    },
    333: {
        id: 333,
        rating: 4
    }
};
