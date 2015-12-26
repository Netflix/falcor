/**
 * The list of internal keys.  Instead of a bunch of little files,
 * have them as one exports.  This makes the bundling overhead smaller!
 *
 * http://en.wikipedia.org/wiki/Delimiter#ASCIIDelimitedText
 * record separator character.
 */
var prefix = String.fromCharCode(30);

module.exports = {
    prefix:        prefix,
    absolutePath:  prefix + "absolutePath",
    context:       prefix + "context",
    head:          prefix + "head",
    invalidated:   prefix + "invalidated",
    key:           prefix + "key",
    next:          prefix + "next",
    offset:        prefix + "offset",
    path:          prefix + "path",
    parent:        prefix + "parent",
    prev:          prefix + "prev",
    refIndex:      prefix + "refIndex",
    ref:           prefix + "ref",
    refPath:       prefix + "refPath",
    refsLength:    prefix + "refsLength",
    tail:          prefix + "tail",
    toReference:   prefix + "toReference",
    version:       prefix + "version",
    size:          "$size",
    modelCreated:  "$modelCreated"
};
