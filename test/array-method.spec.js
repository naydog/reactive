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
                g: [4, 3, 5]
            },
            c: [1, 2, 3]
        };
        for (var i in a) {
            reactivejs.set(a, i, a[i]);
        }
        inWatch = '';

        reactivejs.watch(a.b, 'g', function (o, n) {
            inWatch = n;
        }, 'watch1');
    });

    it("Push", function () {
        a.b.g.push(8);
        expect(inWatch).toEqual([4, 3, 5, 8]);
    });

    it("Pop", function () {
        a.b.g.pop();
        expect(inWatch).toEqual([4, 3]);
    });

    it("Shift", function () {
        a.b.g.shift();
        expect(inWatch).toEqual([3, 5]);
    });

    it("Unshift", function () {
        a.b.g.unshift(2);
        expect(inWatch).toEqual([2, 4, 3, 5]);
    });

    it("Splice", function () {
        var deleted = a.b.g.splice(1, 1);
        expect(inWatch).toEqual([4, 5]);
        expect(deleted).toEqual([3]);
    });

    it("Splice 2", function () {
        var deleted = a.b.g.splice(1, 1, 6, 7);
        expect(inWatch).toEqual([4, 6, 7, 5]);
        expect(deleted).toEqual([3]);
        window.xxx = a.b.g;
    });

    it("Sort", function () {
        a.b.g.sort();
        expect(inWatch).toEqual([3, 4, 5]);
    });

    it("Sort 2", function () {
        a.b.g.sort(function (a, b) {
            return b - a;
        });
        expect(inWatch).toEqual([5, 4, 3]);
    });

    it("Reverse", function () {
        a.b.g.reverse();
        expect(inWatch).toEqual([5, 3, 4]);
    });
});