var walk = require('falcor/get/getWalk');
module.exports = {
    getAsJSON: require('falcor/get/getAsJSON')(walk),
    getAsJSONG: require('falcor/get/getAsJSONG')(walk),
    getAsValues: require('falcor/get/getAsValues')(walk),
    getAsPathMap: require('falcor/get/getAsPathMap')(walk),
    getValueSync: require('falcor/get/getValueSync'),
    getBoundValue: require('falcor/get/getBoundValue')
};

