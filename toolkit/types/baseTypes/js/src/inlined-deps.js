/* Base Type Types */

// _BaseTypeMap
/**
 * An internal map of {@link BaseTypeString} members
 * to the respective {@link BaseType} members.
 * 
 * @internal
 * @typedef {{
 *     'string': string,
 *     'symbol': symbol,
 *     'number': number,
 *     'boolean': boolean,
 *     'bigint': bigint,
 *     'function': ( ...args: any[] ) => any,
 *     'null': null,
 *     'undefined': undefined,
 *     'array': any[],
 *     'object': object
 * }} _BaseTypeMap
 * 
 * @author [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see {@link BaseType}
 * @see {@link BaseTypeString}
 */

// BaseType
/**
 * The _Base Types_ from which all types are derived.
 * 
 * These types are a **superset** of the types
 * recognized by the [`typeof` operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof).
 * 
 * The `string`-based variant of this type is {@link BaseTypeString}.
 * 
 * @template {BaseTypeString} [TypeStringT = never]
 *      An optional {@link BaseTypeString} or union of `BaseTypeString` members
 *      used to determine which _Base Types_ should be returned.
 * 
 *      If omitted or `never`, a union of all of the _Base Types_ will be returned.
 * 
 * @returns
 *      A union of _Base Types_.
 * 
 *      If `TypeStringT` contains a {@link BaseTypeString} or union of `BaseTypeString` members,
 *      a union containing all of the corresponding _Base Types_ will be returned.
 * 
 *      If `TypeStringT` is `never` or the entire `BaseTypeString` union,
 *      a union of all of the _Base Types_ will be returned.
 * 
 * @typedef {_BaseTypeMap[
 *     [TypeStringT] extends [never]
 *         ? keyof _BaseTypeMap
 *         : TypeStringT extends keyof _BaseTypeMap
 *             ? TypeStringT
 *             : keyof _BaseTypeMap
 * ]} BaseType
 * 
 * @author  [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see     {@link BaseTypeString}
 * @see     {@link getBaseType `getBaseType()`}
 * @see     {@link isBaseType `isBaseType()`}
 * @see     {@link assertBaseType `assertBaseType()`}
 */

// BaseTypeString
/**
 * The `string` values corresponding to each of the _Base Types_
 * from which all types are derived.
 * 
 * This is the `string`-based variant of the {@link BaseTypeString} type.
 * 
 * @template {BaseType} [TypeT = any]
 *      An optional {@link BaseType} or union of `BaseType` members
 *      used to determine which Base Type `string` members should be returned.
 * 
 *      If omitted or `any`, a union of all of the Base Type `string` members will be returned.
 * 
 * @returns 
 *      A union of Base Type `string` members.
 * 
 *      If `TypeT` contains a {@link BaseType} or union of `BaseType` members,
 *      a union containing all of the corresponding Base Type `string` members will be returned.
 * 
 *      If `TypeT` is `any` or the entire `BaseType` union,
 *      a union of all of the Base Type `string` members will be returned.
 * 
 * @typedef {keyof {
 *     [
 *         K in keyof _BaseTypeMap as (
 *             TypeT extends _BaseTypeMap[K]
 *                 ? K extends "object"
 *                     ? TypeT extends any[]
 *                         ? never
 *                         : TypeT extends (( ...args: any[] ) => any)
 *                             ? never
 *                             : K
 *                     : K
 *                 : never
 *         )
 *     ]: _BaseTypeMap[K];
 * }} BaseTypeString
 * 
 * @author  [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see     {@link BaseType}
 * @see     {@link getBaseType `getBaseType()`}
 * @see     {@link isBaseType `isBaseType()`}
 * @see     {@link assertBaseType `assertBaseType()`}
 */


/* Base Type Functions */

/**
 * Get the {@link BaseType} of the given value.
 * 
 * @template {BaseType} T
 *      The type of the specified value.
 * 
 * @param {T} x
 *      The value being evaluated.
 * 
 * @returns {BaseTypeString<T>}
 *      A {@link BaseTypeString} corresponding to the {@link BaseType} of `x`.
 * 
 * @author      [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see         {@link BaseType}
 * @see         {@link isBaseType `isBaseType()`}
 * @see         {@link assertBaseType `assertBaseType()`}
 */
function getBaseType (x) {

    const xType = typeof x;

    if (xType == 'object') {
        if (xType === null)
            return /** @type {BaseTypeString<T>} */ ("null");
        else if (Array.isArray(x))
            return /** @type {BaseTypeString<T>} */ ("array");
    }

    return /** @type {BaseTypeString<T>} */ (xType);

}
/**
 * Check if the given value is of any of the specified {@link BaseType}s.
 * 
 * @template {BaseTypeString | BaseTypeString[]} TypesT
 *      The type of the `types` argument.
 * 
 * @param {BaseType} x
 *      The value being evaluated.
 * 
 * @param {TypesT} types
 *      The {@link BaseTypeString} or an array of `BaseTypeString`s
 *      corresponding to the {@link BaseType}(s) to check for.
 * 
 * @returns {x is BaseType<TypesT extends BaseTypeString[] ? TypesT[number] : TypesT>}
 *      `true` if `x` is of the specified {@link BaseType}(s)
 *      or `false` if it is not.
 * 
 * @author  [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see     {@link BaseType}
 * @see     {@link getBaseType `getBaseType()`}
 * @see     {@link assertBaseType `assertBaseType()`}
 */
function isBaseType (x, types) {

    return (
        // Inlined TypeScript Toolkit Dependency
        /** @type {TypesT} */ ((Array.isArray(x) ? x : [x]))
    ).includes(getBaseType(x));

}
/**
 * Assert the given value is of any of the specified {@link BaseType}s
 * and throw a {@link TypeError} if it is not.
 * 
 * @template {BaseTypeString | BaseTypeString[]} TypesT
 *      The type of the `types` argument.
 * 
 * @param {BaseType} x
 *      The value being evaluated.
 * 
 * @param {TypesT} types
 *      The {@link BaseTypeString} or an array of `BaseTypeString`s
 *      corresponding to the {@link BaseType}(s) to check for.
 * 
 * @returns
 *      `true` if `x` is of the specified {@link BaseType}(s).
 * 
 * @throws
 *      A {@link TypeError} if `x` is not of the specified {@link BaseType}(s).
 * 
 * @author  [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/types/baseTypes)
 * @see     {@link BaseType}
 * @see     {@link getBaseType `getBaseType()`}
 * @see     {@link isBaseType `isBaseType()`}
 */
function assertBaseType (x, types) {

    /// @inlineDependency arrays.toListString.toListString

    if (!isBaseType(x, types)) {
        throw new TypeError(
            "The specified value is not of "
                + Array.isArray(types)
                        ? `any of the following types: ${toListString(/** @type {BaseTypeString[]} */ (types), ' or ')}`
                        : `type ${types}`
                + ` (A ${getBaseType(x)} was provided).`
        );
    }

    return true;

}