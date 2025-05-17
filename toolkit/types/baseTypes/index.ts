/**
 * Types representing the _Base Types_ from which
 * all types are derived.
 * 
 * These _Base Types_ are a **superset** of the types
 * recognized by the [`typeof` operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof).
 * 
 * @example
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
 * @author Zach Vaughan (FusedKush)
 * @since 1.0.0
 */
declare module "./index.js";

export { default, BaseType, BaseTypeString } from "./module/index.js";