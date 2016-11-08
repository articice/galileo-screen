/**
 * Created by juice on 9/18/16.
 */

var esc = require('escape-string-regexp');

/**
 * helper routine, checks occurence of smallerArray in outerArray at pos i
 * @param outerArray
 * @param smallerArray
 * @param i {int} [0] position of smaller array
 * @returns {boolean}
 */
var subarrayEqual = function(outerArray, smallerArray, i) {
    if (!i) i=0;

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
 * create a screen object
 * @param {int} width
 * @param {int} height
 * @param {string} moreString
 * @param {string} promptString
 */
module.exports = function (width, height, moreString, promptString) {

    /**
     * intersects a continuous chunk of two arrays starting from their ends (with a search limit)
     * @param a
     * @param b
     * @returns {Array}
     */
    function intersectArraysBackwardsContLim(a, b) // based on http://stackoverflow.com/a/1885660/4038307
    {
        const lim = height; //screen height
        var i = 0, lim_i = 150; //number of attempts at finding

        var ai = a.length - 1, bi = b.length - 1;
        var alim = a.length >= lim ? a.length - lim - 1 : 0,
          blim = b.length >= lim ? b.length - lim - 1 : 0;

        var continuous = false;

        var result = [];

        while (i < lim_i && ai >= alim && bi >= blim) {
            i++;

            if (a[ai] < b[bi]) {
                if (continuous) break;
                ai--;
            }
            else if (a[ai] > b[bi]) {
                if (continuous) break;
                bi--;
            }
            else /* they're equal */
            {
                result.unshift(a[ai]);
                ai--;
                bi--;
                continuous = true;
            }

            if (!continuous && ai <= alim) {
                ai = a.length - 1;
                bi--
            }
            else if (!continuous && bi <= blim) {
                bi = b.length - 1;
                ai--
            }
        }

        return result;
    }

    const hasMoreEnd = moreString + promptString;
    /**
     * checks if screen ends in a MD (more data, move down) request prompt
     * @param {string} screen
     * @returns {boolean}
     */
    var hasMore = function (screen) {
        return screen.substr(-2) == hasMoreEnd;
    };

    var lastScreenRegexp = new RegExp("(^|\n)" + esc(promptString) + "$");
    /**
     * internal screen check function
     * returns true if screen does not have an MD prompt
     * returns false if there is more data or string does not have a prompt
     * @param {string} screen
     * @returns {boolean}
     */
    var isLastScreen = function (screen) {
        return !!screen.match(lastScreenRegexp); // typ: /(^|\n)\>$/
    };

    var newlinePromptRegexp = new RegExp("(^|\n)(" + esc(moreString) + "|)" + esc(promptString) + "$");
    /**
     * internal function, removes prompt at the end of string
     * prompt should begin with a newline, i.e. won't remove single-string prompt
     * @param screen
     * @returns {string} screen with the prompt removed (without trailing \n)
     */
    var removePrompt = function (screen) {
        return screen.replace(newlinePromptRegexp, ''); // typ: /(^|\n)(\)|)\]$/
    };

    var noNewlinePromptRegexp = new RegExp("(" + esc(moreString) + "|)" + esc(promptString) + "$");

    /**
     * returns prompt at the end of screen or false
     * @param screen
     * @returns {boolean}
     */
    var hasPrompt = function (screen) {
        var match = screen.match(noNewlinePromptRegexp); // typ: /(\)|)\]$/
        return (match) ? match[0] : false;
    };

    /**
     * Merges last screen at intersect point
     * screens must have all prompts lines removed
     * @param {Array} screen1 lines of screen1
     * @param {Array} screen2 lines
     * @returns {Array} array of merged screen strings
     */
    var mergeLastLinesAtIntersection = function (screen1, screen2) {
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

    var kopernikMerge = function (before, after) {

        var n = before.length;

        for (var i = 0; i < n; i++) {
            if (after[0] == before[i] && subarrayEqual(after, before.slice(i), 0)) {
                // Try to find max position.
                for (var j = i - 1; j > (i - 1) / 2; j--)
                    if (subarrayEqual(after.slice(0, (n - j)), before.slice(j), 0)) i = j;

                return before.slice(0, i).concat(after);
            }
        }

        return before.concat(after);
    };

    var mergeResponse_subst = function (merge_fn, prev, next) {
        var screen1 = removePrompt(prev).split("\n"),
          screen2 = removePrompt(next).split("\n");

        var last_prompt = hasPrompt(next);

        var output;
        if (isLastScreen(next)) {
            output = merge_fn(screen1, screen2);
        } else {
            output = screen1.concat(screen2);
        }

        if (last_prompt) output.push(last_prompt);

        return output.join("\n");
    };


    var lineWidthRegexp = new RegExp(".{1," + width + "}", 'g');
    var wrapLines = function (screen) {
        var lines = screen.split("\n");

        for (var i in lines) {
            var wraps = lines[i].match(lineWidthRegexp); // typ: /.{1,64}/g
            if (wraps) {
                lines.splice.apply(lines, [i, 1].concat(wraps));
                i += wraps.length;
            }
        }

        return lines.join("\n");
    };

    return {
        hasMore: hasMore,
        mergeResponse_subst: mergeResponse_subst,
        wrapLines: wrapLines,
        merge_fns: {
            kopernik: kopernikMerge,
            bcsIntersect: mergeLastLinesAtIntersection
        },
        lib: {
            removePrompt: removePrompt,
            hasPrompt: hasPrompt,
            isLastScreen: isLastScreen
        },
        testing: {
            subarrayEqual: subarrayEqual,
            indexOfArrayInArrayBackwards: indexOfArrayInArrayBackwards,
            intersectArraysBackwardsContLim: intersectArraysBackwardsContLim
        }
    }
};