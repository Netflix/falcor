/**
 * A part of a {@link Path} that can be any JSON value type. All types are coerced to string, except null. This makes the number 1 and the string "1" equivalent. It is illegal to use a string beginning with "__".
 * @typedef {?(string|number|boolean|null)} Key
 */
