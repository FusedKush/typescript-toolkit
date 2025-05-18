/**
 * Transform the specified [union](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
 * into an [intersection](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).
 * 
 * @template U  The union being transformed into an intersection.
 * 
 * @typedef {(
 *     [U] extends [never]
 *         ? never
 *         : (
 *             U extends any
 *                 ? ( x: U ) => void
 *                 : never
 *         ) extends (( x: infer I ) => void)
 *             ? I
 *             : never
 * )} UnionToIntersection
 * 
 * @author [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/unionToIntersection)
 */