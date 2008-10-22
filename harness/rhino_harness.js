var path = 'lib';
var testpath = 'tests';

var libs = [
    'Test/TAP.js',
    'Test/TAP/Class.js',
    'Test/TAP/Runner.js'
    ];

var tests = [
    '01_tap.t.js',
    ];

for (i in libs) {
    var lib = libs[i];
    load(path+'/'+lib);
}

for (i in tests) {
    var test = tests[i];
    var script = readFile(testpath+'/'+test);
    t = eval(script);
    t.run_tests();
}
