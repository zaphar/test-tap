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

import('./suite.mjs').then(async m => {
    const pair = m.Tap.Node();
    m.runTest(pair.Tap, "Tap dogfood test suite", m.tapSuite);
    // Note output requires some async machinery because it uses some dynamic inputs.
    await pair.Renderer.renderAll();
    process.exit(pair.Tap.isPass() ? 0 : 1);
});
