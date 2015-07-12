/**
 * An ordered list of {@link KeySet}s that point to location(s) in the {@link JSONGraph}. It enables pointing to multiple locations in a more terse format than a set of {@link Path}s and is generally more efficient to evaluate.
 * @typedef {Array.<KeySet>} PathSet
 * @example
 // Points to the name and price of products 1234 and 5678
 ["productsById", ["1234", "5678"], ["name", "price"]]
 */
