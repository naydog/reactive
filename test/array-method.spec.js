describe("Array method test suite:", function () {
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

    // it("Set new property by reference", function () {
      
    //     expect(b.c).toEqual(a.b);
    // });

    
});