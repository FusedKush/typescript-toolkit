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


/**
 * Convert the specified array to a `string` containing
 * a list of the elements in the array.
 * 
 * This function is similar to the {@link Array.prototype.join `join()`}
 * method on arrays but behaves slightly differently.
 * 
 * @example
 * toListString([])                                     // ""
 * toListString(["foo"])                                // "foo"
 * toListString(["foo", "bar"])                         // "foo & bar"
 * toListString(["foo", "bar", "baz"]);                 // "foo, bar, & baz"
 * 
 * toListString(["foo", "bar", "baz"], " or ")          // "foo, bar, or baz"
 * toListString(["foo", "bar", "baz"], "")              // "foo, bar, baz"
 * toListString(["foo", "bar", "baz"], null, " - ");    // "foo - bar - baz"
 * toListString(["foo", "bar", "baz"], null, "/");      // "foobarbaz"
 * 
 * @param arr           The array being converted into a list `string`.
 *  
 * @param modifier      The modifier `string` inserted between elements when
 *                      `arr` contains **two elements** or between the last two elements
 *                      when `arr` contains **three or more elements**.
 *  
 *                      If an empty `string` or `null` is provided, no modifier
 *                      string will be inserted into the returned `string`.
 *  
 * @param separator     The separator `string` inserted between elements when
 *                      `arr` contains **three or more elements**.
 * 
 *                      If an empty `string` or `null` is provided, no separator
 *                      string will be inserted into the returned `string`.
 * 
 * @returns             A List `string` made up of the stringified elements of `arr`.
 * 
 * @author              Zach Vaughan (FusedKush)
 * @since               1.0.0
 */
export function toListString (
    arr: unknown[],
    modifier: string | null = ' & ',
    separator: string | null = ', '
): string {

    const separatorStr: string = separator ?? '';
    const modifierStr: string = modifier ?? '';

    switch (arr.length) {
        case 0:
            return "";
        case 1:
            return String(arr[0]);
        case 2:
            return `${String(arr[0])}${modifierStr}${String(arr[1])}`;
        
        default: {
            
            const lastIndex = (arr.length - 1);
            let listStr = "";
        
            for (let i = 0; i < arr.length; i++) {
                if (i > 0) {
                    listStr += separator;

                    if (i == lastIndex) {
                        if (modifierStr.startsWith(' ') && separatorStr.endsWith(' '))
                            listStr = listStr.trimEnd();

                        listStr += modifierStr;
                    }
                }

                listStr += String(arr[i]);
            }
        
            return listStr;

        }
    }

}

export default toListString;