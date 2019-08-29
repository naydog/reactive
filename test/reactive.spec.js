describe("Reactive test suite:", function () {
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
            reactivejs.set(a, i, a[i]);
        }
    });

    it("Set new property by reference", function () {
        var b = {};
        // If b.c is set to a.b through "setByRef", a.b will change when b.c is re-assigned
        reactivejs.setByRef(b, 'c', a.b);
        b.c = 1;
        expect(b.c).toEqual(a.b);
    });

    it("Set new property by operator =", function () {
        var b = {};
        // If b.c is set to a.b through operator =, re-assign b.c will not affect a.b
        b.c = a.b;
        b.c = 1;
        expect(b.c).not.toEqual(a.b);
    });

    it('Set by reference on non-reactive object', function () {
        var b = {};

        expect(function () {
            reactivejs.setByRef(b, 'c', a);
        }).toThrow('Not a reactive object');
    });

    it('Set by reference on non-reactive property', function () {
        var b = {};
        a.d = 3;

        expect(function () {
            reactivejs.setByRef(b, 'c', a, 'd');
        }).toThrow('Property "d" of source object is not reactive');
    });

    it("Set array to array", function () {
        a.b.g = [1,2,3];
        expect(a.b.g.length).toEqual(3);
    });

    it("Update object", function () {
        a.b.f = { c: 'fee', h: 321};
        expect(JSON.stringify(a.b.f)).toEqual('{"h":321,"c":"fee"}');
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
