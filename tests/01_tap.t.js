import('../src/TAP.mjs').then(m => {
    var runNodeTap = m.runNodeTap;

    function tapSuite(t) {
        var out = "nothing yet";
        var diag = "";
        t.plan(17);
        
        var testCan = function () {
            // setup fake test object
            var f = new m.Tap(function(newout) { out = newout }); // the TAP thats failing
            f.out = function(newout) { out = newout };
            f.diag = function(newdiag) { diag += newdiag };
            f.plan(4);
            
            //mock a fake object to run test against
            var obj = new Object;
            obj.run = function() {};
            var method = 'run';
            
            // begin real tests!
            f.can_ok(obj, 'not_there');
            t.like(out, /not ok 1 - object can \[ not_there \]/, 'can_ok failed');
            f.can_ok(obj, method);
            diag = '';
            t.like(out, /ok 2 - object can \[ run \]/, 'can_ok passed');
            
            //Now we need to test the whole prototype method assignment thing
            
            function MockObj() {
                this.attr = 1;
            }
            
            MockObj.prototype.fakeme = function () {};
            
            f.can_ok(MockObj, 'fakeme');
            diag = '';
            t.like(out, /^ok .* \[ fakeme \]/, 
                'can_ok recognized prototype methods');
            f.can_ok(MockObj, 'fakeme2');
            diag = '';
            t.like(out, /^not ok .* \[ fakeme2 \]/, 
                'can_ok prototype recognization doesnt break methods');
        };
        
        var testLike = function() {
            // setup fake test object
            var f = new m.Tap(function(newout) { out = newout }); // the TAP that's failing
            f.out = function(newout) { out = newout };
            f.plan(1);
            
            // begin real tests!
            f.like("hello", /hello/, "hello matches hello");
            t.like(out, /ok 1 - hello matches hello/, 'got description in TAP output');
        };
        
        var testDiag = function() {
            // setup fake test object
            var f = new m.Tap(function(newout) { out = newout }); // the TAP that's failing
            f.out = function(newout) { out = newout };
            f.plan(10);
            // begin real tests!
            f.diag("hello");
            t.like(out, /# hello/, 'got hello');
        };
        
        var testException = function() {
            // setup fake test object
            var f = new m.Tap(function(newout) { out = newout }); // the TAP that's failing
            f.out = function(newout) { out = newout };
            f.plan(2);
            
            // begin real tests!
            f.throws_ok(function() {throw new Error('I made a boo boo')}, 'I made a boo boo');
            //t.diag(out);
            t.like(out, /ok 1 - code threw \[Error: I made a boo boo\]/, 'uncaught exception');
            f.throws_ok(function() {}, 'I made a boo boo');
            //t.diag(out);
            t.like(out, /not ok 2 - code threw \[ \]/, 'false failed');
        };
        testException();
        
        var testFails = function() {
            // setup fake test object
            var f = new m.Tap(function(newout) { out = newout }); // the TAP that's failing
            f.out = function(newout) { out = newout };
            f.plan(3);
            
            // begin real tests!
            f.ok(false, 'false fails');
            t.like(out, /not ok 1 - false fails/, 'false failed');
            
            f.ok(0, 'zero fails');
            t.like(out, /not ok 2 - zero fails/, '0 failed');
            
            f.is(0, 1, 'zero is one');
            t.like(out, /not ok 3 - zero is one/, '0 != 1');
        };
        testFails();
        
        var testPass = function() {
            t.ok(true, 'true is true');
            t.is(1,1, '1 is 1');
            t.pass('pass passes');
            t.like("hello world", /hel+o/, 'regexen work');
            t.unlike("hello there", /world/, 'no world');
        };
        testPass();
        
        var testPlan = function() {
            // setup fake test object
            var f = new m.Tap(function(newout) { out = newout }); // the TAP that's failing
            f.out = function(newout) { out = newout };
            f.plan(2);
            
            // begin real tests!
            f.ok(false, 'false fails');
            t.is(f.counter, 1, 'counter increments by one');
            t.is(f.planned, 2, 'planned = 2');
        };
        testPlan();
        
        var testTodoSkip = function() {
            var out;
            t.can_ok(m.Tap, 'todo', 'skip');
            var f = new m.Tap(); // the TAP that's failing
            f.out = function(newout) { out = newout };
            f.plan(4);
            
            f.todo(function() {
                f.ok(true, 'true is true');
            });
            t.like(out, /ok 1 - # TODO: true is true/g, 
                'the non todo output is suitably formatted');
            f.ok(!false, 'not false is true');
            t.like(out, /ok 2 -/g, 'the regular output is suitably formatted');
           
            f.skip(true, 'because I said so', 1,
                function() {
                    f.is(1, 2, 'one is two');
                }
            );
            t.like(out, /^not ok 3 - # SKIP because I said so$/,
                'the skipped output is suitably formatted');
            f.is(1, 1, 'one is one');
            t.like(out, /ok 4 - one is one/,
                'the non skipped output is suitable formatted');
        };
        testTodoSkip();
        
        return t;
    }
    runNodeTap("Tap dogfood test suite", tapSuite);
});
