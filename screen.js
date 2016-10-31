/**
 * Created by juice on 9/18/16.
 */

/**
 * helper routine, checks occurence of smallerArray in outerArray at pos i
 * @param outerArray
 * @param smallerArray
 * @param i
 * @returns {boolean}
 */
var subarrayEqual = function(outerArray, smallerArray, i) {
    for(var j = 0; j < smallerArray.length; ++j) {
        if (outerArray[i+j] != smallerArray[j]) {
            return false
        }
    }

    return true;
};

/**
 * searches for occurence of smallerArray in outerArray, starting from the back
 * NOTE quadratic search time
 * @param outerArray
 * @param smallerArray
 * @returns {number} position or -1 if not found
 */
var indexOfArrayInArrayBackwards = function(outerArray,  smallerArray) {
    for(var i = outerArray.length - 1; i >= 1 ; i--) {
        if (subarrayEqual(outerArray, smallerArray, i)) return i;
    }
    return -1;
};

/**
 * intersects a continuous chunk of two arrays starting from their ends (with a search limit)
 * @param a
 * @param b
 * @returns {Array}
 */
function intersectArraysBackwardsContLim(a, b) // based on http://stackoverflow.com/a/1885660/4038307
{
    var lim = 64;
    var ai= a.length-1, bi= b.length-1;
    var alim = a.length >= lim ? a.length - lim -1 : 0,
        blim = b.length >= lim ? b.length - lim - 1 : 0;

    var continuous = false;

    var result = [];

    while( ai >= alim && bi >= blim )
    {
        if      (a[ai] < b[bi] ){ if (continuous) break; ai--; }
        else if (a[ai] > b[bi] ){ if (continuous) break; bi--; }
        else /* they're equal */
        {
            result.unshift(a[ai]);
            ai--;
            bi--;
            continuous = true;
        }
    }

    return result;
}

/**
 * checks if screen ends in a MD (more data, move down) request prompt
 * @param {string} screen
 * @returns {boolean}
 */
var hasMore = function(screen) {
    return screen.substr(-2) == ')]';
};

/**
 * internal screen check function
 * returns true if screen does not have an MD prompt
 * returns false if there is more data or string does not have a prompt
 * @param {string} screen
 * @returns {boolean}
 */
var isLastScreen = function(screen) {
    return !!screen.match(/(^|\n)\]$/);
};

/**
 * internal function, removes prompt at the end of string
 * prompt should begin with a newline, i.e. won't remove single-string prompt
 * @param screen
 * @returns {string} screen with the prompt removed (without trailing \n)
 */
var removePrompt = function(screen) {
    return screen.replace(/(^|\n)(\)|)\]$/, '');
};

/**
 * returns prompt at the end of screen of false
 * @param screen
 * @returns {boolean}
 */
var hasPrompt = function(screen) {
    var match = screen.match(/(\)|)\]$/);
    return (match) ? match[0]:false;
};

/**
 * Merges last screen at intersect point
 * screens must have all prompts lines removed
 * @param {Array} screen1 lines of screen1
 * @param {Array} screen2 lines
 * @returns {Array} array of merged screen strings
 */
var mergeLastLinesAtIntersection = function(screen1, screen2) {
    var output;
    var common = intersectArraysBackwardsContLim(screen1, screen2);

    if (common.length) { // screens intersect
        var pos = indexOfArrayInArrayBackwards(screen1, common);
        output = screen1.slice(0, pos);
    } else { // in some cases last screen is just on the boundary
        output = screen1; // fallback
    }

    Array.prototype.push.apply(output, screen2);
    return output;
};

/**
 * Merges next screen onto previous
 * - automatic recognition of last screen merge
 * - automatic management of command prompts
 * @param prev {string} previous screen (or complete response)
 * @param next {string} next screen
 * @returns {string} complete screen
 */
var mergeResponse = function(prev, next) {

    var screen1 = removePrompt(prev).split("\n"),
        screen2 = removePrompt(next).split("\n");

    var last_prompt = hasPrompt(next);

    var output;
    if (isLastScreen(next)) {
        output = mergeLastLinesAtIntersection(screen1, screen2);
    } else {
        output = screen1.concat(screen2);
    }

    if (last_prompt) output.push(last_prompt);

    return output.join("\n");
};



var wrapLines = function(screen) {
    var lines = screen.split("\n");

    for (var i in lines) {
        var wraps = lines[i].match(/.{1,64}/g);
        if (wraps) {
            lines.splice.apply(lines, [i, 1].concat(wraps));
            i += wraps.length;
        }
    }

    return lines.join("\n");
};

module.exports = {
    hasMore: hasMore,
    mergeResponse: mergeResponse,
    wrapLines: wrapLines,
    lib: {
        removePrompt: removePrompt,
        hasPrompt: hasPrompt,
        isLastScreen: isLastScreen,
        mergeLastLinesAtIntersection: mergeLastLinesAtIntersection
    },
    testing: {
        subarrayEqual: subarrayEqual,
        indexOfArrayInArrayBackwards: indexOfArrayInArrayBackwards,
        intersectArraysBackwardsContLim: intersectArraysBackwardsContLim
    }
};