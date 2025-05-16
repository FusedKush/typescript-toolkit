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

export { default, ArrayifyType, arrayify } from "./module/index.js";