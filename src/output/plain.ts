import type { EventPresentation } from "./presentation.js";

export function renderPlain(events: EventPresentation[]): string {
    return events.map(renderEvent).join("\n");
}

function renderEvent(event: EventPresentation): string {
    const eventText = event.fragments
        .map((fragment) => fragment.text)
        .join(" ");

    return `${event.createdAt} ${eventText}`;
}
