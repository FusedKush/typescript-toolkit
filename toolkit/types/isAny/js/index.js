/**
 * Determine if the given type is `any`.
 * 
 * @template T  The type being evaluated.
 * 
 * @returns     `true` if `T` is `any` and `false` otherwise.
 * 
 * @typedef {(
 *     boolean extends (T extends never ? true : false)
 *         ? true
 *         : false
 * )} IsAny
 * 
 * @author [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/toolkit/types/isAny)
 */