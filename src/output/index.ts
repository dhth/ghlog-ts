import type { Event, EventVisibility } from "../domain/event.js";
import type { Username } from "../domain/username.js";
import type { Result } from "../result.js";
import type { OutputFormat } from "./format.js";
import { renderHtml } from "./html/index.js";
import { renderMarkdown } from "./markdown.js";
import { renderPlain } from "./plain.js";
import { toEventPresentation } from "./presentation.js";
import { renderTerminal } from "./terminal.js";

export function render(
    events: Event[],
    referenceTime: Date,
    format: OutputFormat,
    username: Username,
    eventVisibility: EventVisibility,
): Result<string, Error> {
    const eventPresentations = events.map(toEventPresentation);

    switch (format.kind) {
        case "html":
            return renderHtml(
                eventPresentations,
                referenceTime,
                format.template,
                username,
                eventVisibility,
            );
        case "markdown":
            return {
                tag: "ok",
                value: renderMarkdown(eventPresentations),
            };
        case "plain":
            return {
                tag: "ok",
                value: renderPlain(eventPresentations, referenceTime),
            };
        case "terminal":
            return {
                tag: "ok",
                value: renderTerminal(eventPresentations, referenceTime),
            };
    }
}
