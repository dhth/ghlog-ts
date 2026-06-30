import type { EventKind } from "../../domain/event.js";
import type { EventPresentation, Fragment } from "../presentation.js";

export type HtmlContext = {
    activityLabel: string;
    branding: Branding;
    events: HtmlEvent[];
    timestamp: string;
    userUrl: string;
    username: string;
};

export type Branding = {
    toolName: string;
    url: string;
};

type HtmlFragment = {
    text: string;
    url?: string;
    title?: string;
};

export const htmlEventKinds = [
    "comment",
    "create",
    "delete",
    "issues",
    "pull-request-review",
    "pull-request",
    "push",
    "release",
] as const;

export type HtmlEventKind = (typeof htmlEventKinds)[number];

type HtmlEvent = {
    eventKind: HtmlEventKind;
    fragments: HtmlFragment[];
    timestamp: string;
};

export function htmlEvents(events: EventPresentation[]): HtmlEvent[] {
    return events.map((event) => {
        return {
            eventKind: htmlEventKind(event.kind),
            fragments: event.fragments.map(htmlFragment),
            timestamp: formatUtcTimestamp(event.createdAt),
        };
    });
}

function htmlFragment(fragment: Fragment): HtmlFragment {
    const htmlFragment: HtmlFragment = {
        text: fragment.text,
    };
    if (fragment.url) {
        htmlFragment.url = fragment.url;
    }
    if (fragment.detail) {
        htmlFragment.title = fragment.detail;
    }

    return htmlFragment;
}

function htmlEventKind(kind: EventKind): HtmlEventKind {
    switch (kind) {
        case "issue_comment":
            return "comment";
        case "pull_request":
            return "pull-request";
        case "pull_request_review":
            return "pull-request-review";
        default:
            return kind;
    }
}

export function formatUtcTimestamp(timestamp: Date): string {
    const day = timestamp.getUTCDate();
    const month = new Intl.DateTimeFormat("en-US", {
        month: "short",
        timeZone: "UTC",
    }).format(timestamp);
    const year = timestamp.getUTCFullYear();
    const hour = timestamp.getUTCHours().toString().padStart(2, "0");
    const minute = timestamp.getUTCMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year} · ${hour}:${minute} UTC`;
}
