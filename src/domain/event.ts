import type { Result } from "../result.js";

export type EventLimit = number & { readonly __brand: "EventLimit" };

export function parseEventLimit(value: unknown): Result<EventLimit, string> {
    const maybeNumber = Number(value);

    if (!Number.isFinite(maybeNumber)) {
        return {
            tag: "err",
            error: "value must be a number",
        };
    }

    if (!Number.isInteger(maybeNumber)) {
        return {
            tag: "err",
            error: "value must be an integer",
        };
    }

    const number = maybeNumber;
    if (number < 1 || number > 300) {
        return {
            tag: "err",
            error: "value must be in the range [1, 300]",
        };
    }

    return {
        tag: "ok",
        value: number as EventLimit,
    };
}

export type Issue = {
    number: number;
    title: string;
    html_url: string;
    pull_request?: unknown;
};

export type IssueComment = {
    html_url: string;
};

export type PullRequestRepo = {
    name: string;
};

export type PullRequestBranch = {
    ref: string;
    repo: PullRequestRepo;
};

export type PullRequest = {
    number: number;
    base: PullRequestBranch;
    head: PullRequestBranch;
};

export type PullRequestReview = {
    state: string;
    html_url: string;
};

export type Release = {
    html_url: string;
    tag_name: string;
    prerelease: boolean;
    draft: boolean;
};

export type PushEventPayload = {
    kind: "push";
    ref: string;
    head: string;
    before: string;
};

export type CreateEventPayload = {
    kind: "create";
    ref: string;
    ref_type: string;
};

export type DeleteEventPayload = {
    kind: "delete";
    ref: string;
    ref_type: string;
};

export type IssuesEventPayload = {
    kind: "issues";
    action: string;
    issue: Issue;
};

export type IssueCommentEventPayload = {
    kind: "issue_comment";
    action: string;
    issue: Issue;
    comment: IssueComment;
};

export type PullRequestEventPayload = {
    kind: "pull_request";
    action: string;
    pull_request: PullRequest;
};

export type PullRequestReviewEventPayload = {
    kind: "pull_request_review";
    action: string;
    review: PullRequestReview;
    pull_request: PullRequest;
};

export type ReleaseEventPayload = {
    kind: "release";
    action: string;
    release: Release;
};

export type EventPayload =
    | CreateEventPayload
    | DeleteEventPayload
    | IssueCommentEventPayload
    | IssuesEventPayload
    | PullRequestEventPayload
    | PullRequestReviewEventPayload
    | PushEventPayload
    | ReleaseEventPayload;

export type Repo = {
    name: string;
    url: string;
};

export type Event = {
    id: string;
    repo: Repo;
    payload: EventPayload;
    created_at: string;
};

export type EventVisibility = "public_only" | "include_private";

export const eventKinds = [
    "create",
    "delete",
    "issue_comment",
    "issues",
    "pull_request_review",
    "pull_request",
    "push",
    "release",
] as const;

export type EventKind = (typeof eventKinds)[number];

export function parseEventKinds(
    values: string[],
): Result<EventKind[], string[]> {
    const valid: EventKind[] = [];
    const invalid: string[] = [];

    for (const value of values) {
        if (isValidEventKind(value)) {
            valid.push(value);
        } else {
            invalid.push(value);
        }
    }

    if (invalid.length > 0) {
        return {
            tag: "err",
            error: invalid,
        };
    }

    return {
        tag: "ok",
        value: valid,
    };
}

function isValidEventKind(value: string): value is EventKind {
    return eventKinds.some((eventKind) => eventKind === value);
}
