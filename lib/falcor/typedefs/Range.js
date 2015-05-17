/**
 * Describe a range of integers. Must contain either a "to" or "length" property
 * @typedef {Object} Range
 * @property {number} [from=0] - The lower bound of the range (inclusive)
 * @property {?number} to - The upper bound of the range (inclusive). Must be >= to the "from" value
 * @property {?number} length - The length of the range. Must be >= 0
 * @example
 // The following range specifies the numbers 0, 1, and 2
 {from: 0, to: 2}
 // The following range specifies the numbers 1 and 2
 {from: 1, length: 2}
 */