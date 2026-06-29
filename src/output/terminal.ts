import {
    type Color,
    type EventPresentation,
    eventColor,
    type Fragment,
    humanizedTime,
} from "./presentation.js";

const OSC = "\u{1b}]";
const ST = "\u{1b}\\";
const RESET = "\u{1b}[0m";

export function renderTerminal(
    events: EventPresentation[],
    referenceTime: Date,
): string {
    return events.map((event) => renderEvent(event, referenceTime)).join("\n");
}

function renderEvent(event: EventPresentation, referenceTime: Date): string {
    const relativeTime = humanizedTime(event.createdAt, referenceTime);
    const time = colorize(relativeTime.padEnd(13), "gray");
    const eventText = event.fragments.map(renderFragment).join(" ");

    const eventTextColorized = colorize(eventText, eventColor(event.kind));

    return `${time} ${eventTextColorized}`;
}

function renderFragment(fragment: Fragment): string {
    if (fragment.url) {
        return `${OSC}8;;${fragment.url}${ST}${fragment.text}${OSC}8;;${ST}`;
    }

    return fragment.text;
}

function colorize(text: string, color: Color): string {
    const code = ansiCode(color);

    return `${code}${text}${RESET}`;
}

function ansiCode(color: Color): string {
    switch (color) {
        case "blue":
            return "\u{1b}[34m";
        case "gray":
            return "\u{1b}[90m";
        case "green":
            return "\u{1b}[32m";
        case "purple":
            return "\u{1b}[35m";
        case "red":
            return "\u{1b}[31m";
        case "yellow":
            return "\u{1b}[33m";
    }
}
