describe("Reactive test suite", function () {
    var a;
    beforeEach(function () {
        a = {
            a: 1,
            b: {
                c: 2,
                d: 3,
                f: {
                    h: 'aaa'
                },
                g: [4, 5]
            },
            c: [1, 2, 3]
        };
        for (var i in a) {
            set(a, i, a[i]);
        }
    });

    it("Set new property by reference", function () {
        var b = {};
        console.log('If b.c is set to a.b through "setByRef", a.b will change when b.c is re-assigned');
        setByRef(b, 'c', a.b);
        b.c = 1;
        expect(b.c).toEqual(a.b);
    });

    it("Set new property by operator =", function () {
        var b = {};
        console.log('If b.c is set to a.b through operator =, re-assign b.c will not affect a.b');
        b.c = a.b;
        b.c = 1;
        expect(b.c).not.toEqual(a.b);
    });

    it("Set new object", function () {
        expect(Object.keys(a.b.f)).toEqual(["h"]);
        a.b.f = {};
        expect(Object.keys(a.b.f)).toEqual([]);
    });

    it("Set old property in new object", function () {
        expect(Object.keys(a.b.f)).toEqual(["h"]);
        a.b.f = {};
        a.b.f.h = '5';
        expect(Object.keys(a.b.f)).toEqual(["h"]);
    });    
});

describe("Watch test suite 1:", function () {
    var a;
    beforeEach(function () {
        a = {
            b: {
                c: 2,
                d: 3,
                f: {
                    g: 'aaa'
                },
                g: [4, 5]
            }
        };
        for (var i in a) {
            set(a, i, a[i]);
        }
    });

    it('Primitive to object', function () {
        var inWatch = '';
        watch(a.b, 'c', function (o, n) {
            inWatch = JSON.stringify(n);
        });
        a.b.c = {
            x: 94
        };
        expect(inWatch).toEqual('{"x":94}');
    });

    it('Object to primitive', function () {
        var inWatch = '';
        watch(a.b, 'f', function (o, n) {
            inWatch = JSON.stringify(n);
        });
        a.b.f = 1;
        expect(inWatch).toEqual('1');
    });

    it('Array to object', function () {
        var inWatch = '';
        watch(a.b, 'g', function (o, n) {
            inWatch = JSON.stringify(n);
        });
        a.b.g = {
            c: 3
        };
        expect(inWatch).toEqual('{"c":3}');
    });

    it('Object to array', function () {
        var inWatch = '';
        watch(a.b, 'f', function (o, n) {
            inWatch = JSON.stringify(n);
        });
        a.b.f = [7, 8];
        expect(inWatch).toEqual('[7,8]');
    });

    it('Still watches if a property is removed and re-added', function () {
        var inWatch = '';
        watch(a.b.f, 'g', function (o, n) {
            inWatch = JSON.stringify(n);
        });
        a.b.f = {};
        a.b.f.g = 4;

        expect(inWatch).toEqual('4');
    });

    it('No watch if parent is removed and re-added, and then add a same old property', function () {
        var inWatch = '';
        watch(a.b.f, 'g', function (o, n) {
            inWatch = JSON.stringify(n);
        });
        a.b.f.g = 5;

        a.b = {}; // update parent
        a.b.f = {
            c: 5
        };
        a.b.f.g = 4;

        expect(inWatch).toEqual('5');
    });

    it('"set" a property multiple times causes a watch execute multiple times', function () {
        var inWatch = '';
        watch(a.b.f, 'g', function (o, n) {
            inWatch += (inWatch ? '\t' : '') + JSON.stringify(n);
        });
        a.b.f.g = '444';
        expect(inWatch).toEqual('"444"');
        
        inWatch = '';
        set(a.b.f, 'g', a.b.f.g);
        a.b.f.g = '555';
        expect(inWatch).toEqual('"555"');
    });
});

describe("Watch test suite 2:", function () {
    var a;
    beforeEach(function () {
        a = {
            b: {
                c: 2,
                d: 3,
                f: {
                    g: 'aaa'
                },
                g: [4, 5]
            }
        };
        for (var i in a) {
            set(a, i, a[i]);
        }
    });

    it('Unwatch', function () {
        var inWatch = '';
        watch(a.b.f, 'g', function (o, n) {
            inWatch = JSON.stringify(n);
        });

        a.b.f.g = 5;
        expect(inWatch).toEqual('5');

        unwatch(a.b.f, 'g');
        a.b.f.g = 4;
        expect(inWatch).toEqual('5');
    });
});