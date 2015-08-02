var walk = require("./../get/getWalk");

module.exports = {
    getAsJSON: require("./../get/getAsJSON")(walk),
    getAsJSONG: require("./../get/getAsJSONG")(walk),
    getAsValues: require("./../get/getAsValues")(walk),
    getAsPathMap: require("./../get/getAsPathMap")(walk),
    getValueSync: require("./../get/getValueSync"),
    getBoundValue: require("./../get/getBoundValue")
};
