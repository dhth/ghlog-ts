import { describe, expect, it } from "vitest";
import { parseEventLimit } from "./event.js";

describe("parseEventLimit", () => {
    it("parses a valid value", () => {
        // GIVEN
        const value = "50";
        // WHEN
        const result = parseEventLimit(value);
        // THEN
        expect(result).toEqual({ tag: "ok", value: 50 });
    });

    it("rejects a non-number value", () => {
        // GIVEN
        const value = "not a number";
        // WHEN
        const result = parseEventLimit(value);
        // THEN
        expect(result).toEqual({ tag: "err", error: "value must be a number" });
    });

    it("rejects a non-integer value", () => {
        // GIVEN
        const value = "3.14";
        // WHEN
        const result = parseEventLimit(value);
        // THEN
        expect(result).toEqual({
            tag: "err",
            error: "value must be an integer",
        });
    });

    it("rejects zero", () => {
        // GIVEN
        const value = "0";
        // WHEN
        const result = parseEventLimit(value);
        // THEN
        expect(result).toEqual({
            tag: "err",
            error: "value must be in the range [1, 300]",
        });
    });

    it("rejects a negative value", () => {
        // GIVEN
        const value = "-20";
        // WHEN
        const result = parseEventLimit(value);
        // THEN
        expect(result).toEqual({
            tag: "err",
            error: "value must be in the range [1, 300]",
        });
    });

    it("rejects a value greater than 300", () => {
        // GIVEN
        const value = "301";
        // WHEN
        const result = parseEventLimit(value);
        // THEN
        expect(result).toEqual({
            tag: "err",
            error: "value must be in the range [1, 300]",
        });
    });
});
