/**
* Tap - a 0 dependency TAP compliant test library useable from the commandline
* 
* ```js
* import { Tap } from './src/TAP.mjs';
* var t = new Tap;
* t.plan(3);
* 
* t.ok(true, 'True is True'); # test will pass
* t.is(1, 2, 'one is two'); # test will fail
* 
* var obj = {};
* obj.method1 = function() { return true; };
* 
* t.can_ok(obj, 'method1'); # test will pass
* ```
* 
* @module TAP
* @license Artistic-2.0
*/

/**
 * The Tap Test Class helper.
 */
class Tap {
    /** @type Number? */
    planned = null;
    /** @type Number */
    counter = 0;
    /** @type Number */
    passed  = 0;
    /** @type Number */
    failed  = 0;
    /** @type function(TestOutput) */
    #renderLine

    /**
     * Construct a new Tap Suite with a renderLine function.
     * @param {function(string)}
     */
    constructor(renderFunc) {
        this.#renderLine = renderFunc;
    }

  
    static Browser() {
        return new Tap(function(text) {
            // TODO(zaphar): Handle output in a Browser context.
        });
    }

    static Node() {
        return new Tap(function(text) {
            import('node:process').then(loaded => {;
                loaded.stdout.write(text + "\n");
            })
        });
    }

    /** Renders output for the test results */
    out(text) {
        this.#renderLine(text);
    };

    /**
     * Construct a Tap output message.
     *
     * @param {boolean} ok
     * @param {string=} description 
     */
    mk_tap(ok, description){
        if(!this.planned){
            this.out("You tried to run tests without a plan.  Gotta have a plan.");
            throw new Error("You tried to run tests without a plan.  Gotta have a plan.");
        }
        this.counter++;
        this.out(ok + ' ' + this.counter + ' - ' + (description || ""));
    };


    /** Diagnostic formatter for TAP Output.
     *
     * @param msg {string}
     */
    diag(msg){
        if (!msg) {
            msg = " ";
        }
        var lines = msg.split("\n");
        for (var line of lines) {
            this.out('# ' + msg);
        }
    };

    /** Render a pass TAP output message.
     * @param {string} description 
     */
    pass(description) {
        this.mk_tap('ok', description);    
    };
    
    /** Render a fail TAP output message.
     * @param {string} description 
     */
    fail(description) {
        this.mk_tap('not ok', description);
    };
   
    /** Run a function as a TODO test.
     *
     * @param {function(this:Tap, boolean, description)} func 
     */
    todo(func) {
        var self = this;
        var tapper = self.mk_tap;
        self.mk_tap = function(ok, desc) {
            tapper.apply(self, [ok, "# TODO: "+desc]);
        }
        func();
        self.mk_tap = tapper;
    }
   
    /** Run a function as a skip Test.
     *
     * @param {boolean} criteria 
     * @param {string} reason 
     * @param {number} count - The number of tests to skip 
     * @param {function(this:Tap, boolean, description)} func 
     */
    skip(criteria, reason, count, func) {
        var self = this;
        if (criteria) {
            var tapper = self.mk_tap;
            self.mk_tap = function(ok, desc) {
                tapper.apply(self, [ok, desc]);
            }
            for(var i = 0; i < count; i++) {
                self.fail("# SKIP "+reason)
            }
            self.mk_tap = tapper;
        } else {
            func();
        }
    }

    /** Sets the test plan.
     * Once set this can not be reset again. Any attempt to change the plan once already
     * set will throw an exception.
     *
     * Call with no arguments if you don't want to specify the number of tests to run.
     *
     * @param {Number=} testCount 
     */
    plan(testCount) {
        if(this.planned){
            throw new Error("you tried to set the plan twice!");
        }
        if (!testCount) {
            this.planned = 'no_plan';
        } else {
            this.planned = testCount;
            this.out('1..' + testCount);
        }
    };
    
    #pass_if(func, desc){
        var result = func();
        if(result) { this.pass(desc) }
        else       { this.fail(desc) }
    }
    
    // exception tests

    /**
     * Tests that a function throws with a given error message.
     *
     * @param {function()} func
     * @param {RegExp} msg 
     */
    throws_ok(func, msg) {
        var errormsg = ' ';
        if (typeof func != 'function')
            this.diag('throws_ok needs a function to run');
        
        try {
            func();
        }
        catch(err) {
            errormsg = err+'';
        }
        this.like(errormsg, msg, 'code threw [' + errormsg + '] expected: [' + msg + ']');
    }
    
    /**
     * Tests that a function throws.
     *
     * @param {function()} func
     */
    dies_ok(func) {
        var errormsg = ' ';
        var msg = false;
        if (typeof func != 'function')
            this.diag('throws_ok needs a function to run');
        
        try {
            func();
        }
        catch(err) {
            errormsg = err+'';
            msg = true;
        }
        this.ok(msg, 'code died with [' + errormsg + ']');
    }
    
    /**
     * Tests that a function does not throw an exception.
     *
     * @param {function()} func
     */
    lives_ok(func, msg) {
        var errormsg = true;
        if (typeof func != 'function')
            this.diag('throws_ok needs a function to run');
        
        try {
            func();
        }
        catch(err) {
            errormsg = false;
        }
        this.ok(errormsg, msg);
    }

    /**
     * Tests that an object has a given method or function.
     *
     * @param {*} obj 
     */
    can_ok(obj) {
        var desc = 'object can [';
        var pass = true;
        for (var i=1; i<arguments.length; i++) {
            if (typeof(obj[arguments[i]]) != 'function') {
                //this.diag('TypeOf ' + arguments[i] + ' method is: ' + typeof(obj[arguments[i]]) );
                //this.diag('TypeOf prototype is: ' + typeof(obj.prototype) );
                if (typeof(obj.prototype) != 'undefined') {
                    var result = typeof eval('obj.prototype.' + arguments[i]);
                    //this.diag('TypeOf prototype method is: ' + result);
                    if (result == 'undefined') {
                        pass = false;
                        this.diag('Missing ' + arguments[i] + ' method');
                    }
                } else {
                    pass = false;
                    this.diag('Missing ' + arguments[i] + ' method');
                }
            }
            desc += ' ' + arguments[i];
        }
        desc += ' ]';
        this.#pass_if(function(){
    	    return pass;
        }, desc);
    
    }

    /**
     * Tests that two given objects are equal.
     *
     * @param {*} got 
     * @param {*} expected
     * @param {string} desc 
     */
    is(got, expected, desc) {
        this.#pass_if(function(){ return got == expected; }, desc);
    };


    /**
     * Test that expression evaluates to true value
     *
     * @param {*} got
     * @param {string} desc 
     */
    ok(got, desc) {
        this.#pass_if(function(){ return !!got; }, desc);
    };


    /**
     * Tests that a string matches the regex.
     *
     * @param {string} string
     * @param {RegExp} regex
     * @param {string} desc 
     */
    like(string, regex, desc) {
        this.#pass_if(function(){
                if(regex instanceof RegExp) {
                    return string.match(regex)
                } else {
                    return string.indexOf(regex) != -1
                }
    	}, desc)
    }

    /**
     * The opposite of like. tests that the string doesn't match the regex.
     *
     * @param {string} string
     * @param {RegExp} regex
     * @param {string} desc 
     */
    unlike(string, regex, desc) {
        this.#pass_if(function(){
                return !string.match(regex);
	    }, desc)
    }

}

// TODO(zaphar): The runner interface as well.
export { Tap };
