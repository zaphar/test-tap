/** @implements TapRenderer */
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

import('./suite.mjs').then(m => {
    m.runTest(m.Tap.Node(), "Tap dogfood test suite", m.tapSuite);
});
