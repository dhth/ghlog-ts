import type { EventKind } from "../domain/event.js";
import type { EventPresentation, Fragment } from "./presentation.js";

export function renderMarkdown(events: EventPresentation[]): string {
    return events.map((event) => renderEvent(event)).join("\n");
}

function renderEvent(event: EventPresentation): string {
    const emoji = eventEmoji(event.kind);

    const eventText = event.fragments.map(renderFragment).join(" ");

    return `- ${emoji} ${eventText}`;
}

function renderFragment(fragment: Fragment): string {
    if (fragment.url) {
        return `[${fragment.text}](${fragment.url})`;
    }

    return fragment.text;
}

function eventEmoji(kind: EventKind): string {
    switch (kind) {
        case "create":
            return "🌱";
        case "delete":
            return "🗑️";
        case "issue_comment":
            return "💬";
        case "issues":
            return "❗";
        case "pull_request":
            return "🔀";
        case "pull_request_review":
            return "📝";
        case "push":
            return "⬆️";
        case "release":
            return "📦";
    }
}
