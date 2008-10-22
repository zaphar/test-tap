var libpath = 'lib';
var extpath = 'ext';
var testpath = 't';

var extlibs = [
    'Test/TAP.js',
    'Test/TAP/Class.js',
    'Test/TAP/Runner.js',
    'joose.js'
    ];

var libs = [
    '<list external libs here>'
    ];

var tests = [
    '<list test files here>',
    ];

for (i in extlibs) {
    var lib = extlibs[i];
    load(extpath+'/'+lib);
}

for (i in libs) {
    var lib = libs[i];
    load(libpath+'/'+lib);
}

for (i in tests) {
    var test = tests[i];
    var script = readFile(testpath+'/'+test);
    t = eval(script);
    t.run_tests();
}
