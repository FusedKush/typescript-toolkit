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
 * @author [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/toolkit/types/isAny)
 */
type IsAny <T> = (
    boolean extends (T extends never ? true : false)
        ? true
        : false
);