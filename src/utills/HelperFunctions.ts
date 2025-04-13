/**
 * this module is for helpers that uses in the whole project
 * 
 *//////////////////////////////////////////////////////////





/**
 * this function is for helping for creating the right format for gold weight
 * @param weight 
 * @returns 
 */
export function formatGoldWeight(weight) {
    return parseFloat((Math.round(weight * 100) / 100).toFixed(3));
}

