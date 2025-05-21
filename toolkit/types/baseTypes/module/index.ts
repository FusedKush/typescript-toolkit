/**
 * Types representing the _Base Types_ from which
 * all types are derived.
 * 
 * These _Base Types_ are a **superset** of the types
 * recognized by the [`typeof` operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof).
 * 
 * @example
 * // Types //
 * 
 * type BaseTypeUnion = BaseType;
 * // string | number | bigint | boolean | symbol | object | any[] | ((...args: any[]) => any) | null | undefined
 * 
 * type BaseTypeStringUnion = BaseTypeString;
 * // "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null" | "array"
 * 
 * type CustomBaseTypeUnion = BaseType<"string" | "array" | "null">;
 * // string | any[] | null
 * 
 * type CustomBaseTypeStringUnion = BaseTypeString<"Hello, World!" | [42] | null>;
 * // "string" | "array" | "null"
 * 
 * type NestedBaseTypeUnion = BaseType<BaseTypeString<"Hello, World!">>;
 * // string
 * 
 * type NestedBaseTypeStringUnion = BaseTypeString<BaseType<"function">>;
 * // ( ...args: any[] ) => any;
 * 
 * 
 * // Functions //
 * 
 * var baseTypeValue = getBaseType(["foo", "bar", "baz"]);
 * // "array"
 * 
 * if (isBaseType(someUnknownValue, ["string", "number", "boolean"])) {
 *    console.log(`The Unknown Value: ${someUnknownValue}`);
 * }
 * 
 * assertBaseType([42], ["object", "function"]);
 * // throws: TypeError("The specified value is not of any of the following types: object or function (A array was provided).");
 * 
 * @author Zach Vaughan (FusedKush)
 * @since 1.0.0
 */
declare module "./index.js";

import { arrayify, toListString } from "../../../arrays/index.js";


/* Internal Helper Types */

/**
 * An internal map of {@link BaseTypeString} members
 * to the respective {@link BaseType} members.
 * 
 * @internal
 * @see {@link BaseType}
 * @see {@link BaseTypeString}
 */
type _BaseTypeMap = {
    'string': string,
    'symbol': symbol,
    'number': number,
    'boolean': boolean,
    'bigint': bigint,
    'function': ( ...args: any[] ) => any,
    'null': null,
    'undefined': undefined,
    'array': any[],
    'object': object
};


/* Exported Types */

/**
 * The _Base Types_ from which all types are derived.
 * 
 * These types are a **superset** of the types
 * recognized by the [`typeof` operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof).
 * 
 * The `string`-based variant of this type is {@link BaseTypeString}.
 * 
 * @example
 * type BaseTypeUnion = BaseType;
 * // string | number | bigint | boolean | symbol | object | any[] | ((...args: any[]) => any) | null | undefined
 * 
 * type CustomBaseTypeUnion = BaseType<"string" | "array" | "null">;
 * // string | any[] | null
 * 
 * @template TypeStringT    An optional {@link BaseTypeString} or union of `BaseTypeString` members
 *                          used to determine which _Base Types_ should be returned.
 * 
 *                          If omitted or `never`, a union of all of the _Base Types_ will be returned.
 * 
 * @returns                 A union of _Base Types_.
 * 
 *                          If `TypeStringT` contains a {@link BaseTypeString} or union of `BaseTypeString` members,
 *                          a union containing all of the corresponding _Base Types_ will be returned.
 * 
 *                          If `TypeStringT` is `never` or the entire `BaseTypeString` union,
 *                          a union of all of the _Base Types_ will be returned.
 * 
 * @author                  Zach Vaughan (FusedKush)
 * @since                   1.0.0
 * 
 * @see                     {@link BaseTypeString}
 * @see                     {@link getBaseType `getBaseType()`}
 * @see                     {@link isBaseType `isBaseType()`}
 * @see                     {@link assertBaseType `assertBaseType()`}
 */
export type BaseType <TypeStringT extends BaseTypeString = never> = _BaseTypeMap[
    [TypeStringT] extends [never]
        ? keyof _BaseTypeMap
        : TypeStringT extends keyof _BaseTypeMap
            ? TypeStringT
            : keyof _BaseTypeMap
];

/**
 * The `string` values corresponding to each of the _Base Types_
 * from which all types are derived.
 * 
 * This is the `string`-based variant of the {@link BaseTypeString} type.
 * 
 * @example
 * type BaseTypeStringUnion = BaseTypeString;
 * // "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null" | "array"
 * 
 * type CustomBaseTypeStringUnion = BaseTypeString<"Hello, World!" | [42] | null>;
 * // "string" | "array" | "null"
 * 
 * @template TypeT  An optional {@link BaseType} or union of `BaseType` members
 *                  used to determine which Base Type `string` members should be returned.
 * 
 *                  If omitted or `any`, a union of all of the Base Type `string` members will be returned.
 * 
 * @returns         A union of Base Type `string` members.
 * 
 *                  If `TypeT` contains a {@link BaseType} or union of `BaseType` members,
 *                  a union containing all of the corresponding Base Type `string` members will be returned.
 * 
 *                  If `TypeT` is `any` or the entire `BaseType` union,
 *                  a union of all of the Base Type `string` members will be returned.
 * 
 * @author          Zach Vaughan (FusedKush)
 * @since           1.0.0
 * 
 * @see             {@link BaseType}
 * @see             {@link getBaseType `getBaseType()`}
 * @see             {@link isBaseType `isBaseType()`}
 * @see             {@link assertBaseType `assertBaseType()`}
 */
export type BaseTypeString <TypeT extends BaseType = any> = keyof {
    [
        K in keyof _BaseTypeMap as (
            TypeT extends _BaseTypeMap[K]
                ? K extends "object"
                    ? TypeT extends any[]
                        ? never
                        : TypeT extends (( ...args: any[] ) => any)
                            ? never
                            : K
                    : K
                : never
        )
    ]: _BaseTypeMap[K];
};


/* Exported Functions */

/**
 * Get the {@link BaseType} of the given value.
 * 
 * @template T  The type of the specified value.
 * 
 * @param x     The value being evaluated.
 * 
 * @returns     A {@link BaseTypeString} corresponding to the {@link BaseType} of `x`.
 * 
 * @author      Zach Vaughan (FusedKush)
 * @since       1.0.0
 * 
 * @see         {@link BaseType}
 * @see         {@link isBaseType `isBaseType()`}
 * @see         {@link assertBaseType `assertBaseType()`}
 */
export function getBaseType <T extends BaseType> ( x: T ): BaseTypeString<T> {

    const xType = typeof x;

    if (xType == 'object') {
        if (xType === null)
            return "null" as BaseTypeString<T>;
        else if (Array.isArray(x))
            return "array" as BaseTypeString<T>;
    }

    return xType as BaseTypeString<T>;

}
/**
 * Check if the given value is of any of the specified {@link BaseType}s.
 * 
 * @template TypesT The type of the `types` argument.
 * 
 * @param x         The value being evaluated.
 * 
 * @param types     The {@link BaseTypeString} or an array of `BaseTypeString`s
 *                  corresponding to the {@link BaseType}(s) to check for.
 * 
 * @returns         `true` if `x` is of the specified {@link BaseType}(s)
 *                  or `false` if it is not.
 * 
 * @author          Zach Vaughan (FusedKush)
 * @since           1.0.0
 * 
 * @see             {@link BaseType}
 * @see             {@link getBaseType `getBaseType()`}
 * @see             {@link assertBaseType `assertBaseType()`}
 */
export function isBaseType <TypesT extends BaseTypeString | BaseTypeString[]> (
    x: BaseType,
    types: TypesT
): x is BaseType<TypesT extends BaseTypeString[] ? TypesT[number] : TypesT> {

    return (arrayify(types) as TypesT).includes(getBaseType(x));

}
/**
 * Assert the given value is of any of the specified {@link BaseType}s
 * and throw a {@link TypeError} if it is not.
 * 
 * @template TypesT The type of the `types` argument.
 * 
 * @param x         The value being evaluated.
 * 
 * @param types     The {@link BaseTypeString} or an array of `BaseTypeString`s
 *                  corresponding to the {@link BaseType}(s) to check for.
 * 
 * @returns         `true` if `x` is of the specified {@link BaseType}(s).
 * 
 * @throws          A {@link TypeError} if `x` is not of the specified {@link BaseType}(s).
 * 
 * @author          Zach Vaughan (FusedKush)
 * @since           1.0.0
 * 
 * @see             {@link BaseType}
 * @see             {@link getBaseType `getBaseType()`}
 * @see             {@link isBaseType `isBaseType()`}
 */
export function assertBaseType <TypesT extends BaseTypeString | BaseTypeString[]> (
    x: BaseType,
    types: TypesT
): x is BaseType<TypesT extends BaseTypeString[] ? TypesT[number] : TypesT> {

    if (!isBaseType(x, types)) {
        throw new TypeError(
            "The specified value is not of "
                + Array.isArray(types)
                        ? `any of the following types: ${toListString(types as BaseTypeString[], ' or ')}`
                        : `type ${types}`
                + ` (A ${getBaseType(x)} was provided).`
        );
    }

    return true;

}


/* Default Export */

export * as default from "./index.js";