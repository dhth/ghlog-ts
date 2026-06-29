import { describe, expect, it } from "vitest";
import { humanizedTime } from "./presentation.js";

describe("humanizedTime", () => {
    const referenceTime = new Date("2026-06-28T12:00:00Z");
    const cases = [
        {
            name: "in the future",
            time: new Date("2026-06-28T12:00:01Z"),
            expected: "-",
        },
        {
            name: "same time",
            time: new Date("2026-06-28T12:00:00Z"),
            expected: "just now",
        },
        {
            name: "less than a minute ago",
            time: new Date("2026-06-28T11:59:01Z"),
            expected: "just now",
        },
        {
            name: "one minute ago",
            time: new Date("2026-06-28T11:59:00Z"),
            expected: "1m ago",
        },
        {
            name: "less than two minutes ago",
            time: new Date("2026-06-28T11:58:01Z"),
            expected: "1m ago",
        },
        {
            name: "several minutes ago",
            time: new Date("2026-06-28T11:35:00Z"),
            expected: "25m ago",
        },
        {
            name: "one hour ago",
            time: new Date("2026-06-28T11:00:00Z"),
            expected: "1h ago",
        },
        {
            name: "several hours ago",
            time: new Date("2026-06-28T08:30:00Z"),
            expected: "3h ago",
        },
        {
            name: "less than one day ago",
            time: new Date("2026-06-27T12:00:01Z"),
            expected: "23h ago",
        },
        {
            name: "one day ago",
            time: new Date("2026-06-27T12:00:00Z"),
            expected: "1d ago",
        },
        {
            name: "multiple days ago",
            time: new Date("2026-06-25T12:00:00Z"),
            expected: "3d ago",
        },
    ];

    it.each(cases)("$name", ({ time, expected }) => {
        const result = humanizedTime(time, referenceTime);
        expect(result).toBe(expected);
    });
});
