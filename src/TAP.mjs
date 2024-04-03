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

/** @implements TapRenderer */
class NodeRenderer {
    /** @type {Array<PromiseLike>} */
    #thunks = [];

    out(text) {
        this.#thunks.push(
            // Because this is a ECMAScript module we have to do dynamic module loads
            // of the node ecosystem when running in Node.js.
            import('node:process').then(loaded => {
                loaded.stdout.write(text + "\n");
        }));
    }

    comment(lines) {
        for (var line of lines) {
            this.out('# ' + line);
        }
    }

    // This gives us a way to block on output. It's ghetto but async is a harsh task master.
    async renderAll() {
        for (var thunk of this.#thunks) {
            await thunk;
        }

    }
}

/** @implements TapRenderer */
class BrowserRenderer {
    #target = document.body;

    /** @param {HtmlElement=} target */
    constructor(target) {
        if (target) {
            this.#target = target;
        }
    }

    /** @returns TextNode */
    #createText(text) {
        return document.createTextNode(text);
    }

    /**
     * @param {Node} nodes 
     * @returns HTMLDivElement
     */
    #createDiv(nodes) {
        const div = document.createElement("div");
        div.append(...nodes);
        return div;
    }

    out(text) {
        const textNode = this.#createText(text);
        this.#target.appendChild(this.#createDiv([textNode]));
    }

    comment(lines) {
        // TODO(jeremy):
        var elems = [];
        for (var line of lines) {
            elems.push(this.#createText(line), document.createElement("br"));
        }
        var commentDiv = this.#createDiv(elems);
        commentDiv.setAttribute("class", "tap-comment");
        this.#target.appendChild(commentDiv);
    }
}

/**
 * The Tap Test Class helper.
 */
class Tap {
    /** @type Number? */
    planned = null;
    /** @type Number */
    counter = 0;
    /** @type Number */
    passed = 0;
    /** @type Number */
    failed = 0;
    /** @type TapRenderer */
    renderer

    /**
     * Construct a new Tap Suite with a renderLine function.
     * @param {TapRenderer}
     */
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * @return {{"Renderer": BrowserRenderer, "Tap": Tap}}
     */
    static Browser() {
        var r = new BrowserRenderer();
        return {"Renderer": r, "Tap": new Tap(r)};
        return new Tap(new BrowserRenderer());
    }

    /**
     * @return {{"Renderer": NodeRenderer, "Tap": Tap}}
     */
    static Node() {
        var r = new NodeRenderer();
        return {"Renderer": r, "Tap": new Tap(r)};
    }

    isPass() {
        return this.passed != 0;
    }

    /** Renders output for the test results */
    out(text) {
        this.renderer.out(text);
    };

    /**
     * Construct a Tap output message.
     *
     * @param {boolean} ok
     * @param {string=} description 
     */
    mk_tap(ok, description) {
        if (!this.planned) {
            this.out("You tried to run tests without a plan.  Gotta have a plan.");
            throw new Error("You tried to run tests without a plan.  Gotta have a plan.");
        }
        this.counter++;
        this.out(ok + ' ' + this.counter + ' - ' + (description || ""));
    };


    comment(msg) {
        if (!msg) {
            msg = " ";
        }
        var lines = msg.split("\n");
        this.renderer.comment(lines);
    };

    /** Render a pass TAP output message.
     * @param {string} description 
     */
    pass(description) {
        this.passed++;
        this.mk_tap('ok', description);
    };

    /** Render a fail TAP output message.
     * @param {string} description 
     */
    fail(description) {
        this.failed++;
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
            tapper.apply(self, [ok, "# TODO: " + desc]);
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
            for (var i = 0; i < count; i++) {
                self.fail("# SKIP " + reason)
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
        if (this.planned) {
            throw new Error("you tried to set the plan twice!");
        }
        if (!testCount) {
            this.planned = 'no_plan';
        } else {
            this.planned = testCount;
            this.out('1..' + testCount);
        }
    };

    #pass_if(func, desc) {
        var result = func();
        if (result) { this.pass(desc) }
        else { this.fail(desc) }
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
            this.comment('throws_ok needs a function to run');

        try {
            func();
        }
        catch (err) {
            errormsg = err + '';
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
            this.comment('throws_ok needs a function to run');

        try {
            func();
        }
        catch (err) {
            errormsg = err + '';
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
            this.comment('throws_ok needs a function to run');

        try {
            func();
        }
        catch (err) {
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
        for (var i = 1; i < arguments.length; i++) {
            if (typeof (obj[arguments[i]]) != 'function') {
                if (typeof (obj.prototype) != 'undefined') {
                    var result = typeof eval('obj.prototype.' + arguments[i]);
                    if (result == 'undefined') {
                        pass = false;
                        this.comment('Missing ' + arguments[i] + ' method');
                    }
                } else {
                    pass = false;
                    this.comment('Missing ' + arguments[i] + ' method');
                }
            }
            desc += ' ' + arguments[i];
        }
        desc += ' ]';
        this.#pass_if(function() {
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
        this.#pass_if(function() { return got == expected; }, desc);
    };


    /**
     * Test that expression evaluates to true value
     *
     * @param {*} got
     * @param {string} desc 
     */
    ok(got, desc) {
        this.#pass_if(function() { return !!got; }, desc);
    };


    /**
     * Tests that a string matches the regex.
     *
     * @param {string} string
     * @param {RegExp} regex
     * @param {string} desc 
     */
    like(string, regex, desc) {
        this.#pass_if(function() {
            if (regex instanceof RegExp) {
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
        this.#pass_if(function() {
            return !string.match(regex);
        }, desc)
    }

}

/**
 * Run a test and render a summarization.
 *
 * @param {Tap} t
 * @param {string} testName
 * @param {function(Tap)} test 
 */
function runTest(t, testName, test) {
    t.comment('running ' + testName + ' tests');
    try {
        test(t);
        summarize(t);
    }
    catch (err) {
        t.comment("Test Suite Crashed!!! (" + err + ")");
    }

    return t;
}

/**
 * Output a summary of the tests as comments.
 *
 * @param {Tap} t 
 */
function summarize(t) {
    if (t.planned > t.counter) {
        t.comment('looks like you planned ' + t.planned + ' tests but only ran '
            + t.counter + ' tests');
    } else if (t.planned < t.counter) {
        t.comment('looks like you planned ' + t.planned + ' tests but ran '
            + (t.counter - t.planned) + ' tests extra');
    }
    t.comment('ran ' + t.counter + ' tests out of ' + t.planned);
    t.comment('passed ' + t.passed + ' tests out of ' + t.planned);
    t.comment('failed ' + t.failed + ' tests out of ' + t.planned);
}

/**
 * @param {Tap} t
 * @param {Array<{'plan': Number, name: string, 'test': function(Tap)}} suite 
 */
function runSuite(t, suite) {
    const plan = suite.reduce((acc, item) => {
        return acc + item.plan
    }, 0);
    t.plan(plan);
    for (var item of suite) {
        t.comment('running ' + item.name + ' tests');
        item.test(t);
    }
    summarize(t);
}

export { Tap, runTest, runSuite, summarize, BrowserRenderer, NodeRenderer };

