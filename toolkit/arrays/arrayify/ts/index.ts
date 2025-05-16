/**
 * Convert the specified type into an array, if it is not one already.
 * 
 * @example
 * type Foo = 42;
 * type Bar = ['foo', 'bar'];
 * type ArrayifiedFoo = ArrayifyType<Foo>;  // [42]
 * type ArrayifiedBar = ArrayifyType<Bar>;  // ['foo', 'bar']
 * 
 * type Foobar <T extends string | string[]> = ArrayifyType<T>[number];
 * 
 * @template T  The type being arrayified.
 * 
 * @returns     The arrayified type of `T`.
 * 
 * @author      [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/toolkit/arrays/arrayify)
 * @since       1.0.0
 * @see         {@link arrayify `arrayify()`}
 */
type ArrayifyType <T> = (T extends any[] ? T : [T]);

/**
 * Convert the specified value into an array, if it is not one already.
 * 
 * @example
 * var foo = true;
 * var bar = [1, 2, 3];
 * var arrayifiedFoo = arrayify(foo);       // [true]
 * var arrayifiedBar = arrayify(bar);       // [1, 2, 3]
 * 
 * const foobar = ( numbers: number | number[] ): number => arrayify(numbers).length;
 * 
 * @template T  The type of the value being arrayified.
 * 
 * @param x     The value being arrayified.
 * 
 * @returns     The {@link ArrayifyType arrayified type} of `x`.
 * 
 * @author      [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/toolkit/arrays/arrayify)
 * @since       1.0.0
 * @see         {@link ArrayifyType}
 */
function arrayify <T> ( x: T ): ArrayifyType<T> {

    return (Array.isArray(x) ? x : [x]) as ArrayifyType<T>;

}