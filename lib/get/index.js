var walk = require('./getWalk');
module.exports = {
    getAsJSON: require('./getAsJSON')(walk),
    getAsJSONG: require('./getAsJSONG')(walk),
    getAsValues: require('./getAsValues')(walk),
    getAsPathMap: require('./getAsPathMap')(walk),
    getValueSync: require('./getValueSync'),
    getBoundValue: require('./getBoundValue'),
    setCache: require('./legacy_setCache')
};

