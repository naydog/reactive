describe("Array method test suite:", function () {
    var a;
    var inWatch;
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
        inWatch = '';
    });

    it("Splice", function () {
        reactivejs.watch(a.b, 'g', function(o, n) {
            inWatch = JSON.stringify(n);
        }, 'watch1');
        a.b.g.splice(0, 1);
        expect(inWatch).toEqual("[5]");
    });
    
});