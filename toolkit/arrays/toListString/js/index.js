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
 * @param {unknown[]} arr
 *      The array being converted into a list `string`.
 *  
 * @param {string | null} [modifier = ' & ']
 *      The modifier `string` inserted between elements when
 *      `arr` contains **two elements** or between the last two elements
 *      when `arr` contains **three or more elements**.
 *  
 *      If an empty `string` or `null` is provided, no modifier
 *      string will be inserted into the returned `string`.
 *  
 * @param {string | null} [separator = ', ']
 *      The separator `string` inserted between elements when
 *      `arr` contains **three or more elements**.
 * 
 *      If an empty `string` or `null` is provided, no separator
 *      string will be inserted into the returned `string`.
 * 
 * @returns {string}
 *      A List `string` made up of the stringified elements of `arr`.
 * 
 * @author  [via the _TypeScript Toolkit_](https://github.com/FusedKush/typescript-toolkit/tree/main/toolkit/arrays/toListString)
 * @since   1.0.0
 */
function toListString (arr, modifier, separator) {

    /** @type {string} */
    const separatorStr = separator ?? '';
    /** @type {string} */
    const modifierStr = modifier ?? '';

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