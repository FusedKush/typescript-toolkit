/**
 * An internal map of {@link BaseTypeString} members
 * to the respective {@link BaseType} members.
 * 
 * @internal
 * @author [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
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
 * @author [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see {@link BaseTypeString}
 */
type BaseType <TypeStringT extends BaseTypeString = never> = _BaseTypeMap[
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
 * @author [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see {@link BaseType}
 */
type BaseTypeString <TypeT extends BaseType = any> = keyof {
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