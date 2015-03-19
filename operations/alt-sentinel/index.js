var walk = require('./getWalk');
module.exports = {
    getAsJSON: require('./../alt/get/getAsJSON')(walk),
    getAsJSONG: require('./../alt/get/getAsJSONG')(walk),
    getAsValues: require('./../alt/get/getAsValues')(walk),
    getAsPathMap: require('./../alt/get/getAsPathMap')(walk),
    setPathMapsAsValues: require('./../alt/legacy_setPathMapsAsValues')
};

