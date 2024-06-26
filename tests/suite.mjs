/** @implements TapRenderer */
import { Tap } from '../src/Tap.mjs';

class FakeRenderer {
    output = "nothing yet";
    commentOutput = "";

    out(text) {
        this.output = text;
    }

    comment(lines) {
        for (var line of lines) {
            this.commentOutput += line;
        }
    }
}

function tapSuite(t) {
    t.plan(23);

    var renderer = new FakeRenderer();
    var testCan = function() {
        // setup fake test object
        var f = new Tap(renderer); // the TAP thats failing
        f.plan(4);

        //mock a fake object to run test against
        var obj = new Object;
        obj.run = function() { };
        var method = 'run';

        // begin real tests!
        f.can_ok(obj, 'not_there');
        t.like(renderer.output, /not ok 1 - object can \[ not_there \]/, 'can_ok failed');
        f.can_ok(obj, method);
        t.like(renderer.output, /ok 2 - object can \[ run \]/, 'can_ok passed');

        //Now we need to test the whole prototype method assignment thing

        function MockObj() {
            this.attr = 1;
        }

        MockObj.prototype.fakeme = function() { };

        f.can_ok(MockObj, 'fakeme');
        renderer.commentOutput = '';
        t.like(renderer.output, /^ok .* \[ fakeme \]/,
            'can_ok recognized prototype methods');
        f.can_ok(MockObj, 'fakeme2');
        renderer.commentOutput = '';
        t.like(renderer.output, /^not ok .* \[ fakeme2 \]/,
            'can_ok prototype recognization doesnt break methods');
    };
    testCan();

    var testLike = function() {
        // setup fake test object
        var f = new Tap(renderer); // the TAP that's failing
        f.plan(1);

        // begin real tests!
        f.like("hello", /hello/, "hello matches hello");
        t.like(renderer.output, /ok 1 - hello matches hello/, 'got description in TAP output');
    };
    testLike()

    var testDiag = function() {
        // setup fake test object
        var f = new Tap(renderer); // the TAP that's failing
        f.plan(10);
        // begin real tests!
        f.comment("hello");
        t.comment(renderer.commentOutput);
        t.like(renderer.commentOutput, /hello/, 'got hello');
    };
    testDiag();

    var testException = function() {
        // setup fake test object
        var f = new Tap(renderer); // the TAP that's failing
        f.plan(2);

        // begin real tests!
        f.throws_ok(function() { throw new Error('I made a boo boo') }, 'I made a boo boo');
        //t.comment(renderer.output);
        t.like(renderer.output, /ok 1 - code threw \[Error: I made a boo boo\]/, 'uncaught exception');
        f.throws_ok(function() { }, 'I made a boo boo');
        //t.comment(renderer.output);
        t.like(renderer.output, /not ok 2 - code threw \[ \]/, 'false failed');
    };
    testException();

    var testFails = function() {
        // setup fake test object
        var f = new Tap(renderer); // the TAP that's failing
        f.plan(3);

        // begin real tests!
        f.ok(false, 'false fails');
        t.like(renderer.output, /not ok 1 - false fails/, 'false failed');

        f.ok(0, 'zero fails');
        t.like(renderer.output, /not ok 2 - zero fails/, '0 failed');

        f.is(0, 1, 'zero is one');
        t.like(renderer.output, /not ok 3 - zero is one/, '0 != 1');
    };
    testFails();

    var testPass = function() {
        t.ok(true, 'true is true');
        t.is(1, 1, '1 is 1');
        t.pass('pass passes');
        t.like("hello world", /hel+o/, 'regexen work');
        t.unlike("hello there", /world/, 'no world');
    };
    testPass();

    var testPlan = function() {
        // setup fake test object
        var f = new Tap(renderer); // the TAP that's failing
        f.plan(2);

        // begin real tests!
        f.ok(false, 'false fails');
        t.is(f.counter, 1, 'counter increments by one');
        t.is(f.planned, 2, 'planned = 2');
    };
    testPlan();

    var testTodoSkip = function() {
        t.can_ok(Tap, 'todo', 'skip');
        var f = new Tap(renderer); // the TAP that's failing
        f.plan(4);

        f.todo(function() {
            f.ok(true, 'true is true');
        });
        t.like(renderer.output, /ok 1 - # TODO: true is true/g,
            'the non todo output is suitably formatted');
        f.ok(!false, 'not false is true');
        t.like(renderer.output, /ok 2 -/g, 'the regular output is suitably formatted');

        f.skip(true, 'because I said so', 1,
            function() {
                f.is(1, 2, 'one is two');
            }
        );
        t.like(renderer.output, /^not ok 3 - # SKIP because I said so$/,
            'the skipped output is suitably formatted');
        f.is(1, 1, 'one is one');
        t.like(renderer.output, /ok 4 - one is one/,
            'the non skipped output is suitable formatted');
    };
    testTodoSkip();

    return t;
}

export { tapSuite };
