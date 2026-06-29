import { type EventPresentation, humanizedTime } from "./presentation.js";

export function renderPlain(
    events: EventPresentation[],
    referenceTime: Date,
): string {
    return events.map((event) => renderEvent(event, referenceTime)).join("\n");
}

function renderEvent(event: EventPresentation, referenceTime: Date): string {
    const eventText = event.fragments
        .map((fragment) => fragment.text)
        .join(" ");
    const relativeTime = humanizedTime(event.createdAt, referenceTime);

    return `${relativeTime.padEnd(13)} ${eventText}`;
}
