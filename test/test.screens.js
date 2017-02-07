/**
 * Created by juice on 9/18/16.
 */
var assert = require('assert');
var module = require('../');
var screen = require('../screen')(64, 32, ')', ']');

var current = require('../')(
  {
    cursor: ']'
  }
);

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

var m_tests = {
    Test1: function (fn) {
        var screen1 = "1\n2\n3\n";
        var screen2 = "2\n3\n";
        var correct = "1\n2\n3\n\n2\n3\n";

        test_merging(fn, screen1, screen2, correct, 'merge screens without prompt');
    },

    Test1_1: function (fn) {
        var screen1 = "1\n2\n3\n"; //NOTE: newline at the end
        var screen2 = "2\n3\n]";
        var correct = "1\n2\n3\n\n2\n3\n]";
        test_merging(fn, screen1, screen2, correct, 'merge screens with prompt (newline at the end)');
    },

    Test1_2: function (fn) {
        var screen1 = "1\n2\n3"; //NOTE: no newline at the end
        var screen2 = "2\n3\n]";
        var correct = "1\n2\n3\n]";
        test_merging(fn, screen1, screen2, correct, 'merge screens with prompt (no newline)');
    },

    Test1_3: function (fn) {
        var screen1 = "1\n2\n3\n)]"; //NOTE: correct prompt at the end
        var screen2 = "2\n3\n]";
        var correct = "1\n2\n3\n]";
        test_merging(fn, screen1, screen2, correct, 'merge screens with more prompt (no newline)');
    },

    Test1_4: function (fn) {
        var screen1 = "1\n2\n3)]"; //NOTE: corrupt prompt at the end
        var screen2 = "2\n3\n]";
        var correct = "1\n2\n3)]\n2\n3\n]";
        test_merging(fn, screen1, screen2, correct, 'merge screens with corrupt prompt (no leading newline)');
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
    },

    Test6: function (fn) {
        var screen1 = read('/screens/test6 - screen.txt');
        var screen2 = read('/screens/test6 - screen add.txt');
        var correct = read('/screens/test6 - screen result.txt');

        test_merging(fn, screen1, screen2, correct, 'merging of *FS[n] screens troublesome sample');
    }
};

var shouldNotFail = function(type, tests_list, fn) {
    tests_list.forEach(function (num) {
        console.log("Running Test"+num+" expecting correct output:");
        assert.doesNotThrow(
          type['Test' + num].bind(null, fn),
          null,
          'Test' + num
        );
    });
};

var shouldFail = function(type, tests_list, fn) {
    tests_list.forEach(function (num) {
        console.log("Running Test"+num+" expecting BROKEN output:");
        assert.throws(
          type['Test' + num].bind(null, fn),
          null,
          'Test' + num
        );
    });
};

var shouldInfiniteLoop = function(type, tests_list, fn) {
    tests_list.forEach(function (num) {
        console.log("Running Test"+num+" expecting guarded infinite loop exception");
        assert.throws(
          type['Test' + num].bind(null, fn),
          RangeError,
          'Test' + num
        );
    });
};

describe('Test merging of last MD screen', function() {
    var test = current.mergeResponse;
    it('Test 1 without prompt', m_tests.Test1.bind(null, test));
    it('Test 1_1 with prompt (end newline)', m_tests.Test1_1.bind(null, test));
    it('Test 1_2 with prompt', m_tests.Test1_2.bind(null, test));
    it('Test 1_3 with more prompt', m_tests.Test1_3.bind(null, test));
    it('Test 1_4 corrupt prompt (no leading newline)', m_tests.Test1_4.bind(null, test));
    it('Test 2 lists', m_tests.Test2.bind(null, test));
    it('Test 3 EMD', m_tests.Test3.bind(null, test));
    it('Test 4 FS', m_tests.Test4.bind(null, test));
    it('Test 5 FS', m_tests.Test5.bind(null, test));
    it('Test 6 *FS[N]', m_tests.Test6.bind(null, test));

    describe('Custom cursors', function() {
        var uapiScreen = module({
            cursor: '><'
        });

        describe('Test 8', function() {
            var screen1 = read('/screens/test8 - screen 1.txt');
            var screen2 = read('/screens/test8 - screen 2.txt');
            var correct = read('/screens/test8 - screen result.txt');

            it ('Test 8 screen 1 hasMore', function() {
                assert.equal(uapiScreen.hasMore(screen1), true, 'test8 screen 1 has more');
            });

            it ('Test 8 screen 2 hasMore', function() {
                assert.equal(uapiScreen.hasMore(screen2), false, 'test8 screen 2 doesn\'t have more');
            });

            it('Test 8 *PNR with uAPI cursor', function () {
                test_merging(uapiScreen.mergeResponse, screen1, screen2, correct, 'merging of *PNR screens');
            });

        });
    });

});

describe('Test merging of several screens', function() {
    var screens = [];

    for (var i = 1; i<= 5; i++) screens[i] = read('/screens/test7 - screen'+i+'.txt');

    var response = null;
    screens.forEach(function(text, i) {
        if (i==1) response = text;
        else
            response = current.mergeResponse(response, text);
    });

    console.log(response);

});

var c_tests = {
    Test1_1: function(fn) {
        var result = fn(
          ['1', '2', '3', '4', '1', '2', '3', '1', '2', '3', '1', '2', '3'],
                                                            ['1', '2', '3', '4']
        );

        console.log(result);
        assert.deepEqual(result, ['1', '2', '3'], 'correct intersection');
    },

    Test1_2: function(fn) {
        var result = fn(
          ['1', '2', '3', '1', '2', '3', '1', '2', '3', '1', '2', '3'],
                                        ['1', '2', '3', '1', '2', '3']
        );

        console.log(result);
        assert.deepEqual(result, ['1', '2', '3', '1', '2', '3'], 'correct intersection');
    },

    Test1_3: function(fn) {
        var result = fn(
          ['3', '2', '1', '3', '2', '1', '1', '2', '3', '1', '2', '3'],
                                        ['1', '2', '3', '1', '2', '3', '4']
        );

        console.log(result);
        assert.deepEqual(result, ['1', '2', '3', '1', '2', '3'], 'correct intersection');
    },

    Test1_4: function(fn) {
        var result = fn(
          ['1', '2', '3', '1', '2', '3', '1', '2', '3', '1', '2', '3'],
                                        ['1', '2', '3', '1', '2', '3', '4']
        );

        console.log(result);
        assert.deepEqual(result, ['1', '2', '3', '1', '2', '3'], 'correct intersection');
    },

    Test2_1: function(fn) {
        var result = fn(
          ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'],
                                                           [ 'a', 'b', 'c', 'd']
        );

        console.log(result);
        assert.deepEqual(result, ['a', 'b', 'c'], 'correct intersection');
    },

    Test2_2: function(fn) {
        var result = fn(
          ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'],
                                        ['a', 'b', 'c', 'a', 'b', 'c']
        );

        console.log(result);
        assert.deepEqual(result, ['a', 'b', 'c', 'a', 'b', 'c'], 'correct intersection');
    },

    Test2_3: function(fn) {
        var result = fn(
          ['c', 'b', 'a', 'c', 'b', 'a', 'a', 'c', 'b', 'a', 'b', 'c'],
                                        ['a', 'c', 'b', 'a', 'b', 'c', 'd']
        );

        console.log(result);
        assert.deepEqual(result, ['a', 'c', 'b', 'a', 'b', 'c'], 'correct intersection');
    },

    Test2_4: function(fn) {
        var result = fn(
          ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'],
                                        ['a', 'b', 'c', 'a', 'b', 'c', 'd']
        );

        console.log(result);
        assert.deepEqual(result, ['a', 'b', 'c', 'a', 'b', 'c'], 'correct intersection');
    }

};

describe('Test merge/intersection algorithm continuity', function() {

    describe('with simple number inputs', function() {
        var test = current.lib.merge_fn;

        //if merge algorithm has intersecting property - run additional tests
        if (lib.merge_fn_intersects) {
            it('Test 1_1. Repetitions at the start test',
              c_tests.Test1_1.bind(null, test));
            it('Test 1_2. Repetitions simple test',
              c_tests.Test1_2.bind(null, test));
            it('Test 1_3. Repetitions simple test 2',
              c_tests.Test1_3.bind(null, test));
            it('Test 1_4. Repetitions maximum test',
              c_tests.Test1_4.bind(null, test));
        }
    });

    if (lib.merge_fn_intersects) {
        describe('with simple alphabet inputs', function () {
            var test = current.lib.merge_fn;
            it('Test 2_1. Repetitions at the start test',
              c_tests.Test2_1.bind(null, test));
            it('Test 2_2. Repetitions simple test',
              c_tests.Test2_2.bind(null, test));
            it('Test 2_3. Repetitions simple test 2',
              c_tests.Test2_3.bind(null, test));
            it('Test 2_4. Repetitions maximum test',
              c_tests.Test2_4.bind(null, test));
        });
    }

    if (!lib.merge_fn_intersects) {
        describe('with Galileo screens', function () {

        });
    }
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

    //backwards continuous intersect
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

    // second iteration of the algorithm
    // NOTE in this version infinite loop guarding throws exception instead of exiting with no result
    // passes most m_tests but is too stochastic and is not protected against cycling (or number string comparisons)
    function intersectArraysBackwardsContLim2(a, b) // based on http://stackoverflow.com/a/1885660/4038307
    {
        var lim = 64;

        var i = 0, lim_i = 250;
        var ai= a.length-1, bi= b.length-1;
        var alim = a.length >= lim ? a.length - lim -1 : 0,
          blim = b.length >= lim ? b.length - lim - 1 : 0;

        var continuous = false;

        var result = [];

        while(i < lim_i && ai >= alim && bi >= blim )
        {
            i++;

            // code for testing
            if (i >= lim_i)
              throw new RangeError('Infinite loop reached');
            ////

            if      (a[ai] < b[bi] ){ if (continuous) break; ai--; }
            else if (a[ai] > b[bi] ){ if (continuous) break; bi--; }
            else /* they're equal */
            {
                result.unshift(a[ai]);
                ai--;
                bi--;
                continuous = true;
            }

            if (!continuous && ai <= alim) { ai = a.length-1; bi-- }
            else
            if (!continuous && bi <= blim) { bi = b.length-1; ai-- }
        }

        return result;
    }

    var mergeLastLinesAtIntersection_subst = function(intersect_fn, search_fn, screen1, screen2) {
        var output;
        var common = intersect_fn(screen1, screen2);

        if (common.length) { // screens intersect
            var pos = search_fn(screen1, common);
            output = screen1.slice(0, pos);
        } else { // in some cases last screen is just on the boundary
            output = screen1; // fallback
        }

        Array.prototype.push.apply(output, screen2);
        return output;
    };

    // a way to construct various implementations of screen.mergeReponse
    var mergeResponse_subst = screen.mergeResponse_subst;

    var examined_mergeScreen = function (merge_fn) {
        return mergeResponse_subst.bind(null, merge_fn);
    };

describe('Test merging algorithms', function() {
    it('Forward search is not correct (with forward intersect)', function () {

        var forwardMergeLines_forwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArrays,
            indexOfArrayInArray
          )
        );

        //Tests 1-4 should work with forward search
        shouldNotFail(m_tests, [ 2, 3, 4 ], forwardMergeLines_forwardSearch);

        //Test 5 should fail
        shouldFail(m_tests, ['1_1', 5 ], forwardMergeLines_forwardSearch);
    });

    it('Forward search is not correct (with forward continuous intersect)', function () {

        var forwardMergeLines_forwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArraysCont,
            indexOfArrayInArray
          )
        );

        shouldNotFail(m_tests, [ 2, 3, 4 ], forwardMergeLines_forwardSearch);
        shouldFail(m_tests, ['1_1', 5 ], forwardMergeLines_forwardSearch);
    });

    it('Forward search is not correct (with backward continuous intersect)', function () {

        var backwardMergeLines_forwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArraysBackwardsContLim,
            indexOfArrayInArray
          )
        );

        shouldNotFail(m_tests, [ 1, 2, 3, 4, 5 ], backwardMergeLines_forwardSearch);
        shouldFail(m_tests, [ 6 ], backwardMergeLines_forwardSearch);
    });

    it('Forward search is not correct (with backward continuous intersect 2)', function () {

        var backwardMergeLines_forwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArraysBackwardsContLim2,
            indexOfArrayInArray
          )
        );

        shouldNotFail(m_tests, [1, '1_2', '1_3', 2, 3, 4, 5, 6 ], backwardMergeLines_forwardSearch);
        shouldFail(m_tests, ['1_1'], backwardMergeLines_forwardSearch);
        shouldInfiniteLoop(m_tests, ['1_4'], backwardMergeLines_forwardSearch);
    });

    it('Forward continuous intersection is not correct (with backward search)', function () {
        var backwardMergeLines_forwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArraysCont,
            screen.testing.indexOfArrayInArrayBackwards
          )
        );

        shouldNotFail(m_tests, [ 2, 3, 4 ], backwardMergeLines_forwardSearch);
        shouldFail(m_tests, [ 5 ], backwardMergeLines_forwardSearch);
    });

    it('Backward non-continuous intersection is not correct (with backward search)', function () {
        var backwardNCMergeLines_forwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArraysBackwards,
            screen.testing.indexOfArrayInArrayBackwards
          )
        );

        shouldNotFail(m_tests, [ 2, 3, 4, 5 ], backwardNCMergeLines_forwardSearch);
        shouldFail(m_tests, [ 6 ], backwardNCMergeLines_forwardSearch);
    });

    it('Backwards continuous intersection is correct with most tests', function () {
        var backwardMergeLines_backwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArraysBackwardsContLim,
            screen.testing.indexOfArrayInArrayBackwards
          )
        );

        shouldNotFail(m_tests, [2, 3, 4, 5], backwardMergeLines_backwardSearch);
        shouldFail(m_tests, [6], backwardMergeLines_backwardSearch);
    });

    it('Backwards continuous intersection 2 is correct with most tests', function () {
        var backwardMergeLines_backwardSearch = examined_mergeScreen(
          mergeLastLinesAtIntersection_subst.bind(null,
            intersectArraysBackwardsContLim2,
            screen.testing.indexOfArrayInArrayBackwards
          )
        );

        shouldNotFail(m_tests, ['1_2', '1_3', 2, 3, 4, 5, 6], backwardMergeLines_backwardSearch);
        shouldFail(m_tests, ['1_1'], backwardMergeLines_backwardSearch);
        shouldInfiniteLoop(m_tests, ['1_4'], backwardMergeLines_backwardSearch);
    });

    it('Kopernik merge is ok', function() {

        var merge = examined_mergeScreen(screen.merge_fns.kopernik);

        shouldNotFail(m_tests, [ 1, '1_1', '1_2', '1_3', '1_4', '2', '3',  '2', '3', '4', '5', '6'], merge);
        shouldFail(m_tests, [], merge);
    })

});

describe('Test various backwards intersection algorithms', function() {
    describe('All stochastic intersection algorithms based on string-as-number comparison are unstable with number-strings', function() {
        it('Backwards intersection algorithm', function () {
            shouldFail(c_tests, ['1_1', '1_3', '1_4'], intersectArraysBackwardsContLim);
            shouldNotFail(c_tests, ['1_2'], intersectArraysBackwardsContLim);
        });

        it('Backwards intersection algorithm 2', function () {
            shouldFail(c_tests, ['1_1'], intersectArraysBackwardsContLim2);
            shouldNotFail(c_tests, ['1_2', '1_3', '1_4' ], intersectArraysBackwardsContLim2);
        });
    });
});
});
