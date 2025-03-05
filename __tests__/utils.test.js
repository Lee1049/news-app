const { convertTimestampToDate } = require("../db/seeds/utils");
const { createReferenceObject } = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createReferenceObject", () => {
  test("creates reference object with key-value pairs based on input", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    const result = createReferenceObject(input, "id", "name");
    expect(result).toEqual({
      1: "Alice",
      2: "Bob",
    });
  });

  test("returns an empty object when input array is empty", () => {
    const input = [];
    const result = createReferenceObject(input, "id", "name");
    expect(result).toEqual({});
  });

  test("returns an object with key-value pairs when key and value are valid", () => {
    const input = [
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
    ];
    const result = createReferenceObject(input, "id", "name");
    expect(result[1]).toBe("Alice");
    expect(result[2]).toBe("Bob");
  });

  test("handles an array of objects with different key names", () => {
    const input = [
      { user_id: 1, user_name: "Alice" },
      { user_id: 2, user_name: "Bob" },
    ];
    const result = createReferenceObject(input, "user_id", "user_name");
    expect(result[1]).toBe("Alice");
    expect(result[2]).toBe("Bob");
  });
});
