// ArrayifyType
/**
 * Convert the specified type into an array, if it is not one already.
 * 
 * @template T
 *      The type being arrayified.
 * 
 * @returns
 *      The arrayified type of `T`.
 * 
 * @typedef {(T extends any[] ? T : [T])} ArrayifyType
 * 
 * @author  [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/toolkit/arrays/arrayify)
 * @since   1.0.0
 * @see     {@link arrayify `arrayify()`}
 */

/**
 * Convert the specified value into an array, if it is not one already.
 * 
 * @template T
 *      The type of the value being arrayified.
 * 
 * @param {T} x
 *      The value being arrayified.
 * 
 * @returns {ArrayifyType<T>}
 *      The {@link ArrayifyType arrayified type} of `x`.
 * 
 * @author  [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/toolkit/arrays/arrayify)
 * @since   1.0.0
 * @see     {@link ArrayifyType}
 */
function arrayify (x) {

    return /** @type {ArrayifyType<T>} */ (Array.isArray(x) ? x : [x]);

}