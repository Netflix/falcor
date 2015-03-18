var Constants = {
    NOOP: function NOOP() {},
    __GENERATION_GUID: 0,
    __GENERATION_VERSION: 0,
    __CONTAINER: "__reference_container",
    __CONTEXT: "__context",
    __GENERATION: "__generation",
    __GENERATION_UPDATED: "__generation_updated",
    __INVALIDATED: "__invalidated",
    __KEY: "__key",
    __KEYS: "__keys",
    __IS_KEY_SET: "__is_key_set",
    __NULL: "__null",
    __SELF: "./",
    __PARENT: "../",
    __REF: "__ref",
    __REF_INDEX: "__ref_index",
    __REFS_LENGTH: "__refs_length",
    __ROOT: "/",
    __OFFSET: "__offset",
    __FALKOR_EMPTY_OBJECT: '__FALKOR_EMPTY_OBJECT',

    $TYPE: "$type",
    $SIZE: "$size",
    $EXPIRES: "$expires",
    $TIMESTAMP: "$timestamp",

    SENTINEL: "sentinel",
    ERROR: "error",
    VALUE: "value",
    EXPIRED: "expired",
    LEAF: "leaf"
};

Constants.__INTERNAL_KEYS = [
    Constants.__CONTAINER, Constants.__CONTEXT, Constants.__GENERATION, Constants.__GENERATION_UPDATED,
    Constants.__INVALIDATED, Constants.__KEY, Constants.__KEYS, Constants.__IS_KEY_SET, Constants.__NULL, Constants.__SELF,
    Constants.__PARENT, Constants.__REF, Constants.__REF_INDEX, Constants.__REFS_LENGTH, Constants.__OFFSET, Constants.__ROOT
];

module.exports = Constants;
