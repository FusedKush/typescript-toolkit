/**
 * Determine if the given type is `any`.
 * 
 * @example
 * type Test = IsAny<any>;      // true
 * type Test = IsAny<unknown>;  // false
 * type Test = IsAny<never>;    // false
 * type Test = IsAny<42>;       // false
 * 
 * @author  Zach Vaughan (FusedKush)
 * @author  [via _Stack Overflow_](https://stackoverflow.com/questions/70545982/why-am-i-getting-type-instantiation-is-excessively-deep-and-possibly-infinite#answer-74891993)
 * @since   1.0.0
 */
declare module "./index.js";


/**
 * Determine if the given type is `any`.
 * 
 * @example
 * type Test = IsAny<any>;      // true
 * type Test = IsAny<unknown>;  // false
 * type Test = IsAny<never>;    // false
 * type Test = IsAny<42>;       // false
 * 
 * @template T  The type being evaluated.
 * 
 * @returns     `true` if `T` is `any` and `false` otherwise.
 * 
 * @author      Zach Vaughan (FusedKush)
 * @author      [via _Stack Overflow_](https://stackoverflow.com/questions/70545982/why-am-i-getting-type-instantiation-is-excessively-deep-and-possibly-infinite#answer-74891993)
 * @since       1.0.0
 */
export type IsAny <T> = (
    boolean extends (T extends never ? true : false)
        ? true
        : false
);
export default IsAny;