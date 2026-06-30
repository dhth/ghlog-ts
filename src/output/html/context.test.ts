import { describe, expect, it } from "vitest";
import { formatUtcTimestamp } from "./context.js";

describe("formatUtcTimestamp", () => {
    const cases = [
        {
            name: "formats the canonical timestamp shape",
            timestamp: new Date("2026-06-30T14:25:00Z"),
            expected: "30 Jun 2026 · 14:25 UTC",
        },
        {
            name: "does not pad single-digit days",
            timestamp: new Date("2026-06-03T14:25:00Z"),
            expected: "3 Jun 2026 · 14:25 UTC",
        },
        {
            name: "pads single-digit hours and minutes",
            timestamp: new Date("2026-06-30T04:05:00Z"),
            expected: "30 Jun 2026 · 04:05 UTC",
        },
        {
            name: "formats the instant in UTC",
            timestamp: new Date("2026-06-03T23:30:00-05:00"),
            expected: "4 Jun 2026 · 04:30 UTC",
        },
    ];

    it.each(cases)("$name", ({ timestamp, expected }) => {
        const result = formatUtcTimestamp(timestamp);
        expect(result).toBe(expected);
    });
});
