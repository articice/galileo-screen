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

//tests helper function
var test_merging = function(screen1, screen2, correct, desc) {

    var result = screen.mergeResponse(screen1, screen2);

    console.log(result);
    // IDE-friendly check (produces clear per-line diff)
    assert.deepEqual(result.split("\n"), correct.split("\n"), desc + '(by lines)');
    // raw text check
    assert.equal(result, correct, desc)
};

describe('Test merging of last MD screen', function() {
    it('Test 1', function() {
        var screen1 = "1\n2\n3\n";
        var screen2 = "2\n3\n";
        var correct = "1\n2\n3\n\n2\n3\n";

        test_merging(screen1, screen2, correct, 'merge screens without prompt');

        var screen1 = "1\n2\n3\n";
        var screen2 = "2\n3\n]";
        var correct = "1\n2\n3\n]";

        test_merging(screen1, screen2, correct, 'merge screens with prompt');
    });

    it('Test 2', function() {
        var screen1 = "WS\nWX  - Y\nWY  - Y\nXK  - Y\nXL  - Y\nXM  - Y\nYM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y\n)]";
        var screen2 = "YM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y\n8M  - Y\n9B  - Y\n9H  - Y\n9U  - Y\n9W  - Y\n]";
        var correct = "WS\nWX  - Y\nWY  - Y\nXK  - Y\nXL  - Y\nXM  - Y\nYM  - Y\nYO  - Y\n3K  - Y\n3U  - Y\n4M  - Y\n7I  - Y\n8I  - Y\n8M  - Y\n9B  - Y\n9H  - Y\n9U  - Y\n9W  - Y\n]";

        test_merging(screen1, screen2, correct, 'merging of screens with lists')
    });

    it('Test 3', function() {
        var screen1 = read('/screens/test3 - screen 1.txt');
        var screen2 = read('/screens/test3 - screen 2.txt');
        var correct = read('/screens/test3 - screen result.txt');

        test_merging(screen1, screen2, correct, 'EMD troublesome sample with repetitions');
    });

    it('Test 4', function() {
        var screen1 = read('/screens/test4 - screen 1.txt');
        var screen2 = read('/screens/test4 - screen 2.txt');
        var correct = read('/screens/test4 - screen result.txt');

        test_merging(screen1, screen2, correct, 'merging of FS screens');
    });

    it('Test 5', function() {
        var screen1 = read('/screens/test5 - screen.txt');
        var screen2 = read('/screens/test5 - screen add.txt');
        var correct = read('/screens/test5 - screen result.txt');

        test_merging(screen1, screen2, correct, 'merging of FS screens troublesome sample');
    });

});


// last part of the test is more vague


describe('Test rationality of design decisions' , function() {

})
