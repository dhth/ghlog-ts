import type { Event, EventVisibility } from "../domain/event.js";
import type { Username } from "../domain/username.js";
import type { Result } from "../result.js";
import type { OutputFormat } from "./format.js";
import { renderPlain } from "./plain.js";
import { toEventPresentation } from "./presentation.js";

export function render(
    events: Event[],
    referenceTime: Date,
    format: OutputFormat,
    _username: Username,
    _eventVisibility: EventVisibility,
): Result<string, string> {
    const eventPresentations = events.map(toEventPresentation);

    switch (format.kind) {
        case "plain":
            return {
                tag: "ok",
                value: renderPlain(eventPresentations, referenceTime),
            };
        default:
            return {
                tag: "err",
                error: "unsupported output format",
            };
    }
}
