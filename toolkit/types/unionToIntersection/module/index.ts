/**
 * Convert the specified [union](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
 * into an [intersection](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).
 * 
 * @example
 * interface Foo { foo: string; }
 * interface Bar { bar: number; }
 * 
 * type Foobar = Foo | Bar;
 * // { foo: string; } | { bar: number; }
 * 
 * type Test = UnionToIntersection<Foobar>;
 * // { foo: string; bar: number; }
 * 
 * @author Zach Vaughan (FusedKush)
 * @author [via _Stack Overflow_](https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type#answer-50375286)
 * @since 1.0.0
 */
declare module "./index.js";


/**
 * Transform the specified [union](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
 * into an [intersection](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).
 * 
 * @example
 * interface Foo { foo: string; }
 * interface Bar { bar: number; }
 * 
 * type Foobar = Foo | Bar;
 * // { foo: string; } | { bar: number; }
 * 
 * type Test = UnionToIntersection<Foobar>;
 * // { foo: string; bar: number; }
 * 
 * @template U  The union being transformed into an intersection.
 * 
 * @author      Zach Vaughan (FusedKush)
 * @author      [via _Stack Overflow_](https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type#answer-50375286)
 * @since       1.0.0
 */
export type UnionToIntersection <U> = (
    [U] extends [never]
        ? never
        : (
            U extends any
                ? ( x: U ) => void
                : never
        ) extends (( x: infer I ) => void)
            ? I
            : never
);
export default UnionToIntersection;