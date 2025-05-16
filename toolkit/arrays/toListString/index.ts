/**
 * Convert the specified array to a `string` containing
 * a deliminator-separated list of the elements in the array.
 * 
 * @example
 * toListString([])                                     // ""
 * toListString(["foo"])                                //  "foo"
 * toListString(["foo", "bar"])                         // "foo & bar"
 * toListString(["foo", "bar", "baz"]);                 // "foo, bar, & baz"
 * 
 * toListString(["foo", "bar", "baz"], " or ")          // "foo, bar, or baz"
 * toListString(["foo", "bar", "baz"], "")              // "foo, bar, baz"
 * toListString(["foo", "bar", "baz"], null, " - ");    // "foo - bar - baz"
 * toListString(["foo", "bar", "baz"], null, "/");      // "foobarbaz"
 * 
 * @author  Zach Vaughan (FusedKush)
 * @since   1.0.0
 */
declare module "./index.js";

export { default, toListString } from "./module/index.js";