import { Tap, runTest } from '../src/Tap.mjs';
import { tapSuite } from './suite.mjs';

const pair = Tap.Node();
runTest(pair.Tap, "Tap dogfood test suite", tapSuite);
// Note output requires some async machinery because it uses some dynamic inputs.
await pair.Renderer.renderAll();
process.exit(pair.Tap.isPass() ? 0 : 1);
