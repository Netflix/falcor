function createHardlink(from, to) {
    
    // create a back reference
    var backRefs  = to[__REFS_LENGTH] || 0;
    to[__REF + backRefs] = from;
    to[__REFS_LENGTH] = backRefs + 1;
    
    // create a hard reference
    from[__REF_INDEX] = backRefs;
    from[__CONTEXT] = to;
}

function removeHardlink(cacheObject) {
    var context = cacheObject[__CONTEXT];
    if (context) {
        var idx = cacheObject[__REF_INDEX];
        var len = context[__REFS_LENGTH];
        
        while (idx < len) {
            context[__REF + idx] = context[__REF + idx + 1];
            ++idx;
        }
        
        context[__REFS_LENGTH] = len - 1;
        cacheObject[__CONTEXT] = undefined;
        cacheObject[__REF_INDEX] = undefined;
    }
}

module.exports = {
    create: createHardlink,
    remove: removeHardlink
};
