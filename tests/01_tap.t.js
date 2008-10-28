(function() {
var out = "nothing yet";
var diag = "";
var t = new Test.TAP.Class(); // the real TAP
t.plan(27);

t.testCan = function () {
    var self = this;
    // setup fake test object
    var f = new Test.TAP(); // the TAP thats failing
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
    self.like(out, /ok 2 - object can \[ run \]/, 'can_ok passed');
    
    //Now we need to test the whole prototype method assignment thing
    
    function MockObj() {
        this.attr = 1;
    }
    
    MockObj.prototype.fakeme = function () {};
    
    f.can_ok(MockObj, 'fakeme');
    diag = '';
    self.like(out, /^ok .* \[ fakeme \]/, 
        'can_ok recognized prototype methods');
    f.can_ok(MockObj, 'fakeme2');
    diag = '';
    self.like(out, /^not ok .* \[ fakeme2 \]/, 
        'can_ok prototype recognization doesnt break methods');
}

t.testClassTests = function() {
    var self = this;
    self.ok(Test.TAP.Class, 'Test.TAP.Class namespace exists');
    
    var rout = '';
    var fun = function (value) {
        rout += value;
    }
    
    var testclass = new Test.TAP.Class(fun);
    testclass.plan('no_plan');
    testclass.out = fun;
    self.is(testclass.print, fun, 'testclass has our own printer');
    self.is(testclass.planned, 'no_plan', 'testclass has no plan');
    
    testclass.testMyTest  = function() {
        testclass.ok(1 === 1, 'it worked');
    }
    testclass.run_tests();
    //self.diag("here is rout");
    //self.diag(rout);
    self.like(rout, /ok 1 - it worked/, 'we printed the correct output');
}

t.testDescApears = function() {
    var self = this;
    // setup fake test object
    var f = new Test.TAP(); // the TAP that's failing
    f.out = function(newout) { out = newout };
    f.plan(1);
    self.id = "t";
    f.id = "f";
    
    // begin real tests!
    f.like("hello", /hello/, "hello matches hello");
    self.like(out, /ok 1 - hello matches hello/, 'got description in TAP output');
}

t.testDiag = function() {
    // setup fake test object
    var f = new Test.TAP(); // the TAP that's failing
    f.out = function(newout) { out = newout };
    f.plan(10);
    // begin real tests!
    f.diag("hello");
    t.like(out, /# hello/, 'got hello');
}

t.testException = function() {
    // setup fake test object
    var f = new Test.TAP(); // the TAP that's failing
    f.out = function(newout) { out = newout };
    f.plan(2);
    
    // begin real tests!
    f.throws_ok(function() {throw new Error('I made a boo boo')}, 'I made a boo boo');
    //t.diag(out);
    this.like(out, /ok 1 - code threw \[Error: I made a boo boo\]/, 'uncaught exception');
    f.throws_ok(function() {}, 'I made a boo boo');
    //t.diag(out);
    this.like(out, /not ok 2 - code threw \[ \]/, 'false failed');
}

t.testFails = function() {
    // setup fake test object
    var f = new Test.TAP(); // the TAP that's failing
    f.out = function(newout) { out = newout };
    f.plan(3);
    
    // begin real tests!
    f.ok(false, 'false fails');
    t.like(out, /not ok 1 - false fails/, 'false failed');
    
    f.ok(0, 'zero fails');
    t.like(out, /not ok 2 - zero fails/, '0 failed');
    
    f.is(0, 1, 'zero is one');
    t.like(out, /not ok 3 - zero is one/, '0 != 1');
}

t.testPass = function() {
    this.ok(true, 'true is true');
    this.is(1,1, '1 is 1');
    this.pass('pass passes');
    this.like("hello world", /hel+o/, 'regexen work');
    this.unlike("hello there", /world/, 'no world');
}

t.testPlan = function() {
    var self = this;
    // setup fake test object
    var f = new Test.TAP(); // the TAP that's failing
    f.out = function(newout) { out = newout };
    f.plan(2);
    
    // begin real tests!
    f.ok(false, 'false fails');
    self.is(f.counter, 1, 'counter increments by one');
    self.is(f.planned, 2, 'planned = 2');
}

t.testTodoSkip = function() {
    var self = this;
    var out;
    self.can_ok(Test.TAP, 'todo', 'skip');
    var f = new Test.TAP(); // the TAP that's failing
    f.out = function(newout) { out = newout };
    f.plan(4);
    
    f.todo(function() {
        f.ok(true, 'true is true');
    });
    self.like(out, /ok 1 - # TODO: true is true/g, 
        'the non todo output is suitably formatted');
    f.ok(!false, 'not false is true');
    self.like(out, /ok 2 -/g, 'the regular output is suitably formatted');
   
    f.skip(true, 'because I said so', 1,
        function() {
            f.is(1, 2, 'one is two');
        }
    );
    self.like(out, /^not ok 3 - # SKIP because I said so$/,
        'the skipped output is suitably formatted');
    f.is(1, 1, 'one is one');
    self.like(out, /ok 4 - one is one/,
        'the non skipped output is suitable formatted');
};

return t;
})()
