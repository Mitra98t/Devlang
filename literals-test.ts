
export const tests = (test: (literal: any, expectedResult: any) => void) => {
    test("42", {
        type: "PROGRAM",
        body: {
            type: "NUMBER",
            value: 42,
        },
    });
    test(`"hello"`, {
        type: "PROGRAM",
        body: {
            type: "STRING",
            value: "hello",
        },
    });
    test(`'hello'`, {
        type: "PROGRAM",
        body: {
            type: "STRING",
            value: "hello",
        },
    });
};
