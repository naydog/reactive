describe("Reactive test suite", function () {
    it("Set by reference", function () {
        var a = {
            a: 1,
            b: {
                c: 2,
                d: 3,
                f: {},
                g: [4, 5]
            },
            c: [1, 2, 3]
        };

        toReactiveObject(a);

        var b = {};

        b.c = a.b;
        b.c = 1;
        expect(JSON.stringify(b.c)).not.toEqual(JSON.stringify(a.b));

        setByRef(b, 'c', a.b);
        b.c = 1;
        expect(JSON.stringify(b.c)).toEqual(JSON.stringify(a.b));
    });

    it('Watch value change', function () {
        var a = {
            a: 1,
            b: {
                c: 2,
                d: 3,
                f: {},
                g: [4, 5]
            },
            c: [1, 2, 3]
        };

        toReactiveObject(a);

        var inWatch = '';
        watch(a.b, 'g', function (o, n) {
            inWatch = 'Changed:' + JSON.stringify(n);
        });

        a.b.g = [7, 8];
        expect(inWatch).toEqual('Changed:[7,8]');

        a.b.g = {
            c: 3,
            d: 5
        };
        expect(inWatch).toEqual('Changed:{"c":3,"d":5}');
    });
});