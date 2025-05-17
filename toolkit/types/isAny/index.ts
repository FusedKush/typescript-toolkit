/**
 * Determine if the given type is `any`.
 * 
 * @example
 * type Test = IsAny<any>;      // true
 * type Test = IsAny<unknown>;  // false
 * type Test = IsAny<never>;    // false
 * type Test = IsAny<42>;       // false
 * 
 * @author Zach Vaughan (FusedKush)
 * @author [via _Stack Overflow_](https://stackoverflow.com/questions/55541275/typescript-check-for-the-any-type#answer-77451367)
 * @since 1.0.0
 */
declare module "./index.js";

export { default, IsAny } from "./module/index.js";