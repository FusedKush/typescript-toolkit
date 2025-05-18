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
 * @author      [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/unionToIntersection)
 */
type UnionToIntersection <U> = (
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