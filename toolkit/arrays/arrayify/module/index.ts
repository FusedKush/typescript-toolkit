/**
 * Convert the specified type or value into an
 * array, if it is not one already.
 * 
 * @example
 * type Foo = 42;
 * type Bar = ['foo', 'bar'];
 * type ArrayifiedFoo = ArrayifyType<Foo>;  // [42]
 * type ArrayifiedBar = ArrayifyType<Bar>;  // ['foo', 'bar']
 * 
 * var foo = true;
 * var bar = [1, 2, 3];
 * var arrayifiedFoo = arrayify(foo);       // [true]
 * var arrayifiedBar = arrayify(bar);       // [1, 2, 3]
 * 
 * type Foobar <T extends string | string[]> = ArrayifyType<T>[number];
 * const foobar = ( numbers: number | number[] ): number => arrayify(numbers).length;
 * 
 * @author  Zach Vaughan (FusedKush)
 * @since   1.0.0
 */
declare module "./index.js";


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
 * @author      Zach Vaughan (FusedKush)
 * @since       1.0.0
 * @see         {@link arrayify `arrayify()`}
 */
export type ArrayifyType <T> = (T extends any[] ? T : [T]);

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
 * @author      Zach Vaughan (FusedKush)
 * @since       1.0.0
 * @see         {@link ArrayifyType}
 */
export function arrayify <T> ( x: T ): ArrayifyType<T> {

    return (Array.isArray(x) ? x : [x]) as ArrayifyType<T>;

}

export default arrayify;