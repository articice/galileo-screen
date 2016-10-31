/**
 * Created by juice on 9/18/16.
 */
var assert = require('assert');
var screen = require('../screen');

var fs = require('fs');
var hasNewline = require('detect-newline-at-eof');

var read = function(name) {
    var text = fs.readFileSync(__dirname + name).toString();
    var newline = hasNewline(text);

    if (newline)
        return text.slice(0, -newline.length);
    else
        return text;
};

var lib = screen.lib;

describe('Test helper functions', function() {
    it('Test removePrompt', function() {
        var screen1 = "WS\nWX  - Y\nWY  - Y\nXK  - Y\nXL  - Y\nXM  - Y\nYM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y\n)]";

        assert.equal(lib.removePrompt(screen1), "WS\nWX  - Y\nWY  - Y\nXK  - Y\nXL  - Y\nXM  - Y\nYM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y", 'remove \\n)] at the end')
    });

    it('Test wrapLines with almost no line breaks', function() {
        var screen1 = "SAT 18FEB17 LARNACA     /ATHENS       18/0000 18/2359      G*GAL1 LCA ATH 0540 0725  A3 901 FC X4 N3 GC PC U3 T9 S9 EC J3#320C*E2 LCA ATH 0730 0915 @H1 840 K4 L4 T4 G4 V4 M4 Y4          737  E3 LCA ATH 0800 0945 @EY3702 T4 E4 U4 V4 L4 Q4 M4 K4 H4 B4#320C*E4 LCA ATH 0800 0945  A3 913 FC X5 N4 GC P9 U9 T9 S9 EC J5#320C*E5 LCA ATH 1050 1235 @EY3728 T4 E4 U4 V4 L4 Q4 M4 K4 H4 B4#320C*E6 LCA ATH 1050 1235  A3 903 FC X5 N4 GC P9 U9 T9 S9 EC J5#320C*E7 LCA ATH 1205 1350  EK 107 X9 V9 T9 L9 Q9 H9 K9 U9 B9 M9#77WC*E8 LCA ATH 1605 1750  A3 905 FC X1 N1 GC PC U8 T9 S9 EC J5#320C*E]A*;\n]";

        var result = screen.wrapLines(screen1);

        console.log(result);

        var lines = result.split("\n");
        assert.equal(lines.length, 11);
        assert.equal(lines[0], "SAT 18FEB17 LARNACA     /ATHENS       18/0000 18/2359      G*GAL");
        assert.equal(lines[1], "1 LCA ATH 0540 0725  A3 901 FC X4 N3 GC PC U3 T9 S9 EC J3#320C*E");
        assert.equal(lines[2], "2 LCA ATH 0730 0915 @H1 840 K4 L4 T4 G4 V4 M4 Y4          737  E");
        // ...
        assert.equal(lines[10], "]");

    });

});

describe('Test internal helper functions', function() {
    it('Test isLastScreen', function() {
        assert.equal(
          lib.isLastScreen("ERROR TEXT"),
          false, 'check without prompt'
        );
        
        assert.equal(
          lib.isLastScreen("ERROR TEXT - GALILEO ]"),
          false, 'check with prompt in the same line');
        
        assert.equal(
          lib.isLastScreen("DATA\nDATA\n]"),
          true, 'check with prompt in the end');

        assert.equal(
          lib.isLastScreen("\n]"),
          true, 'check for empty string'
        );
        
        assert.equal(
          lib.isLastScreen("DATA\n)]"),
          false, 'check with MD prompt in the end');
    });

    it('Test removePrompt', function() {

        assert.equal(
          lib.removePrompt("]"),
          '', 'empty screen prompt'
        );

        assert.equal(
          lib.removePrompt(")]"),
          '', 'empty screen MD prompt'
        );
        
        assert.equal(
          lib.removePrompt("DATA\nDATA\n)]"),
          'DATA\nDATA', 'remove MD prompt'
        );

        assert.equal(
          lib.removePrompt("DATA\nDATA\n]"),
          'DATA\nDATA', 'remove last screen prompt'
        );

        assert.equal(
          lib.removePrompt("ERROR - GALILEO  ]"),
          'ERROR - GALILEO  ]', 'remove single string prompt (undefined behavior)'
        );

        assert.equal(
          lib.removePrompt("ERROR STRING"),
          "ERROR STRING", 'no prompt'
        );
    });

    it('Test hasPrompt', function() {

        assert.equal(
          lib.hasPrompt("]"),
          ']', 'empty screen prompt'
        );

        assert.equal(
          lib.hasPrompt(")]"),
          ')]', 'empty screen MD prompt'
        );
        
        assert.equal(
          lib.hasPrompt("DATA\nDATA\n)]"),
          ')]', 'MD prompt'
        );

        assert.equal(
          lib.hasPrompt("DATA\nDATA\n]"),
          ']', 'last screen prompt'
        );

        assert.equal(
          lib.hasPrompt("ERROR - GALILEO  ]"),
          ']', 'single string prompt'
        );

        assert.equal(
          lib.hasPrompt("ERROR STRING"),
          false, 'no prompt'
        );
    });
});

//tests helper function
var test_merging = function(merge_fn, screen1, screen2, correct, desc) {

    var result = merge_fn(screen1, screen2);

    console.log(result);
    // IDE-friendly check (produces clear per-line diff)
    assert.deepEqual(result.split("\n"), correct.split("\n"), desc + '(by lines)');
    // raw text check
    assert.equal(result, correct, desc)
};

var tests = {
    Test1: function (fn) {
        var screen1 = "1\n2\n3\n";
        var screen2 = "2\n3\n";
        var correct = "1\n2\n3\n\n2\n3\n";

        test_merging(fn, screen1, screen2, correct, 'merge screens without prompt');
    },

    Test1_1: function (fn) {
        var screen1 = "1\n2\n3\n";
        var screen2 = "2\n3\n]";
        var correct = "1\n2\n3\n]";
        test_merging(fn, screen1, screen2, correct, 'merge screens with prompt');
    },

    Test2: function (fn) {
        var screen1 = "WS\nWX  - Y\nWY  - Y\nXK  - Y\nXL  - Y\nXM  - Y\nYM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y\n)]";
        var screen2 = "YM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y\n8M  - Y\n9B  - Y\n9H  - Y\n9U  - Y\n9W  - Y\n]";
        var correct = "WS\nWX  - Y\nWY  - Y\nXK  - Y\nXL  - Y\nXM  - Y\nYM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y\n8M  - Y\n9B  - Y\n9H  - Y\n9U  - Y\n9W  - Y\n]";

        test_merging(fn, screen1, screen2, correct, 'merging of screens with lists')
    },

    Test3: function (fn) {
        var screen1 = read('/screens/test3 - screen 1.txt');
        var screen2 = read('/screens/test3 - screen 2.txt');
        var correct = read('/screens/test3 - screen result.txt');

        test_merging(fn, screen1, screen2, correct, 'EMD troublesome sample with repetitions');
    },

    Test4: function (fn) {
        var screen1 = read('/screens/test4 - screen 1.txt');
        var screen2 = read('/screens/test4 - screen 2.txt');
        var correct = read('/screens/test4 - screen result.txt');

        test_merging(fn, screen1, screen2, correct, 'merging of FS screens');
    },

    Test5: function (fn) {
        var screen1 = read('/screens/test5 - screen.txt');
        var screen2 = read('/screens/test5 - screen add.txt');
        var correct = read('/screens/test5 - screen result.txt');

        test_merging(fn, screen1, screen2, correct, 'merging of FS screens troublesome sample');
    }
};

var shouldNotFail = function(tests_list, fn) {
    tests_list.forEach(function (num) {
        console.log("Running Test"+num+" expecting correct output:");
        assert.doesNotThrow(
          tests['Test' + num].bind(null, fn),
          null,
          'Test' + num
        );
    });
};

var shouldFail = function(tests_list, fn) {
    tests_list.forEach(function (num) {
        console.log("Running Test"+num+" expecting BROKEN output:");
        assert.throws(
          tests['Test' + num].bind(null, fn),
          null,
          'Test' + num
        );
    });
};

describe('Test merging of last MD screen', function() {
    var test = screen.mergeResponse;
    it('Test 1', tests.Test1.bind(null, test));
    it('Test 1_1', tests.Test1_1.bind(null, test));
    it('Test 2', tests.Test2.bind(null, test));
    it('Test 3', tests.Test3.bind(null, test));
    it('Test 4', tests.Test4.bind(null, test));
    it('Test 5', tests.Test5.bind(null, test));
});


// last part of the test is more vague
// for incorrect merging algorithm, some tests will fail, others won't
// tests are listed in two categories to replay inconsistencies received with incorrect algorithms

describe('Test rationality of design decisions' , function() {
    // test functions library

    var subarrayEqual = screen.testing.subarrayEqual;

    // unsuitable forward search realization
    var indexOfArrayInArray = function (outerArray, smallerArray) {
        for (var i = 0; i < outerArray.length - smallerArray.length + 1; i++) {
            if (subarrayEqual(outerArray, smallerArray, i)) return i;
        }
        return -1;
    };

    // unsuitable forward non-continuous intersection algorithm
    function intersectArrays(a, b) // http://stackoverflow.com/a/1885660/4038307
    {
        var ai = 0, bi = 0;
        var result = [];

        while (ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) {
                ai++;
            }
            else if (a[ai] > b[bi]) {
                bi++;
            }
            else /* they're equal */
            {
                result.push(a[ai]);
                ai++;
                bi++;
            }
        }

        return result;
    }

    //unsuitable backward non-continuous intersection algorithm
    function intersectArraysBackwards(a, b) // based on http://stackoverflow.com/a/1885660/4038307
    {
        var ai= a.length-1, bi= b.length-1;
        var result = [];

        while( ai >= 0 && bi >= 0 )
        {
            if      (a[ai] < b[bi] ){ ai--; }
            else if (a[ai] > b[bi] ){ bi--; }
            else /* they're equal */
            {
                result.unshift(a[ai]);
                ai--;
                bi--;
            }
        }

        return result;
    }

    // forward continuous intersection algorithm
    function intersectArraysCont(a, b) // based on http://stackoverflow.com/a/1885660/4038307
    {
        var ai = 0, bi = 0;
        var result = [];

        var continuous = false;

        while (ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) {
                if (continuous) break;
                ai++;
            }
            else if (a[ai] > b[bi]) {
                if (continuous) break;
                bi++;
            }
            else /* they're equal */
            {
                result.push(a[ai]);
                ai++;
                bi++;
                continuous = true;
            }
        }

        return result;
    }

    var removeMoreStr = lib.removePrompt;

    // a way to construct incorrect realizations of screen.mergeReponse
    var incorrect_mergeScreen = function (intersect_fn, search_fn, prev, next) {
        var screen1 = removeMoreStr(prev).split("\n"),
          screen2 = next.split("\n");

        var common = intersect_fn(screen1, screen2);

        var output;
        if (common.length) {
            var pos = search_fn(screen1, common);
            output = screen1.slice(0, pos);
        } else {
            output = screen1;
        }

        Array.prototype.push.apply(output, screen2);
        return output.join("\n");
    };

    it('Forward search is not correct (with forward intersect)', function () {

        var forwardMergeLines_forwardSearch = incorrect_mergeScreen.bind(null,
          intersectArrays,
          indexOfArrayInArray
        );

        //Tests 1-4 should work with forward search
        shouldNotFail(['1_1', '2', '3', '4'], forwardMergeLines_forwardSearch);

        //Test 5 should fail
        shouldFail(['5'], forwardMergeLines_forwardSearch);
    });

    it('Forward search is not correct (with forward continuous intersect)', function () {

        var forwardMergeLines_forwardSearch = incorrect_mergeScreen.bind(null,
          intersectArraysCont,
          indexOfArrayInArray
        );

        shouldNotFail(['1_1', '2', '3', '4'], forwardMergeLines_forwardSearch);
        shouldFail(['5'], forwardMergeLines_forwardSearch);
    });

    it('Forward search is not correct (with backward continuous intersect)', function () {

        var backwardMergeLines_forwardSearch = incorrect_mergeScreen.bind(null,
          screen.testing.intersectArraysBackwardsContLim.bind(null, 64),
          indexOfArrayInArray
        );

        shouldNotFail(['1', '4'], backwardMergeLines_forwardSearch);
        shouldFail(['1_1', '2', '3', '5'], backwardMergeLines_forwardSearch);
    });

    it('Forward continuous intersection is not correct (with backward search)', function () {
        var backwardMergeLines_forwardSearch = incorrect_mergeScreen.bind(null,
          intersectArraysCont,
          screen.testing.indexOfArrayInArrayBackwards
        );

        shouldNotFail(['1_1', '2', '3', '4'], backwardMergeLines_forwardSearch);
        shouldFail(['5'], backwardMergeLines_forwardSearch);
    });

    it('Backward non-continuous intersection is not correct (with backward search)', function () {
        var backwardNCMergeLines_forwardSearch = incorrect_mergeScreen.bind(null,
          intersectArraysBackwards,
          screen.testing.indexOfArrayInArrayBackwards
        );

        shouldNotFail(['4', '5'], backwardNCMergeLines_forwardSearch);
        shouldFail(['1', '1_1', '2', '3'], backwardNCMergeLines_forwardSearch);
    });

    it('Backwards continuous intersection is not correct with forward search', function () {
        var backwardMergeLines_forwardSearch = incorrect_mergeScreen.bind(null,
          screen.testing.intersectArraysBackwardsContLim.bind(null, 64),
          indexOfArrayInArray
        );

        shouldNotFail(['1', '4'], backwardMergeLines_forwardSearch);
        shouldFail(['1_1', '2', '3', '5'], backwardMergeLines_forwardSearch);
    });

});
