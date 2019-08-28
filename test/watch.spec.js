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

    it('Watch on non-reactive object', function () {
        var inWatch = '';

        expect(function () {
            watch(a, 'c', function (o, n) {
                inWatch += (inWatch ? '\t' : '') + JSON.stringify(n);
            });
        }).toThrow('Object is not reactive');
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

    it('Add multiple watches on one property', function () {
        var inWatch = '';

        watch(a.b.f, 'g', function (o, n) {
            inWatch += (inWatch ? '\t' : '') + JSON.stringify(n);
        }, 'watch1');
        watch(a.b.f, 'g', function (o, n) {
            inWatch += (inWatch ? '\t' : '') + '2:' + JSON.stringify(n);
        }, 'watch2');
        a.b.f.g = 5;
        expect(inWatch).toEqual('5\t2:5');
    });

    it('Add a same watch twice will count only once', function () {
        var inWatch = '';

        var watchFn = function (o, n) {
            inWatch += (inWatch ? '\t' : '') + JSON.stringify(n);
        }
        watch(a.b.f, 'g', watchFn);
        a.b.f.g = 5;
        expect(inWatch).toEqual('5');

        inWatch = '';
        watch(a.b.f, 'g', watchFn);
        a.b.f.g = 4;
        expect(inWatch).toEqual('4');
    });
});