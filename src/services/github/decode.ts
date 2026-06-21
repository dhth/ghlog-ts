import { z } from "zod";
import type { Event, EventPayload } from "../../domain/event.js";

export function decodeEvents(input: unknown): Event[] {
    return parseRawEvents(input)
        .map(decodeRawEvent)
        .filter((event) => event !== null);
}

const rawRepoSchema = z.object({
    name: z.string(),
    url: z.string(),
});

const rawEventSchema = z.object({
    id: z.string(),
    type: z.string().nullable(),
    repo: rawRepoSchema,
    payload: z.unknown(),
    created_at: z.string(),
});

const rawEventsSchema = z.array(rawEventSchema);

type RawEvent = z.infer<typeof rawEventSchema>;

const supportedEventTypes = [
    "CreateEvent",
    "DeleteEvent",
    "IssueCommentEvent",
    "IssuesEvent",
    "PullRequestEvent",
    "PullRequestReviewEvent",
    "PushEvent",
    "ReleaseEvent",
] as const;

type EventType = (typeof supportedEventTypes)[number];

const rawIssueSchema = z.object({
    number: z.number(),
    title: z.string(),
    html_url: z.string(),
    pull_request: z.unknown().optional(),
});

const rawIssueCommentSchema = z.object({
    html_url: z.string(),
});

const rawPullRequestRepoSchema = z.object({
    name: z.string(),
});

const rawPullRequestBranchSchema = z.object({
    ref: z.string(),
    repo: rawPullRequestRepoSchema,
});

const rawPullRequestSchema = z.object({
    number: z.number(),
    base: rawPullRequestBranchSchema,
    head: rawPullRequestBranchSchema,
});

const rawPullRequestReviewSchema = z.object({
    state: z.string(),
    html_url: z.string(),
});

const rawReleaseSchema = z.object({
    html_url: z.string(),
    tag_name: z.string(),
    prerelease: z.boolean(),
    draft: z.boolean(),
});

const rawCreatePayloadSchema = z.object({
    ref: z.string(),
    ref_type: z.string(),
});

const rawDeletePayloadSchema = z.object({
    ref: z.string(),
    ref_type: z.string(),
});

const rawIssueCommentPayloadSchema = z.object({
    action: z.string(),
    issue: rawIssueSchema,
    comment: rawIssueCommentSchema,
});

const rawIssuesPayloadSchema = z.object({
    action: z.string(),
    issue: rawIssueSchema,
});

const rawPullRequestPayloadSchema = z.object({
    action: z.string(),
    pull_request: rawPullRequestSchema,
});

const rawPullRequestReviewPayloadSchema = z.object({
    action: z.string(),
    review: rawPullRequestReviewSchema,
    pull_request: rawPullRequestSchema,
});

const rawPushPayloadSchema = z.object({
    ref: z.string(),
    head: z.string(),
    before: z.string(),
});

const rawReleasePayloadSchema = z.object({
    action: z.string(),
    release: rawReleaseSchema,
});

function isSupportedEventType(value: string): value is EventType {
    return supportedEventTypes.some((eventType) => eventType === value);
}

function parseRawEvents(input: unknown): RawEvent[] {
    return rawEventsSchema.parse(input);
}

function parseAndDecodePayload(type: EventType, input: unknown): EventPayload {
    switch (type) {
        case "CreateEvent": {
            const payload = rawCreatePayloadSchema.parse(input);
            return {
                kind: "create",
                ref: payload.ref,
                ref_type: payload.ref_type,
            };
        }
        case "DeleteEvent": {
            const payload = rawDeletePayloadSchema.parse(input);
            return {
                kind: "delete",
                ref: payload.ref,
                ref_type: payload.ref_type,
            };
        }
        case "IssueCommentEvent": {
            const payload = rawIssueCommentPayloadSchema.parse(input);
            return {
                kind: "issue_comment",
                action: payload.action,
                issue: payload.issue,
                comment: payload.comment,
            };
        }
        case "IssuesEvent": {
            const payload = rawIssuesPayloadSchema.parse(input);
            return {
                kind: "issues",
                action: payload.action,
                issue: payload.issue,
            };
        }
        case "PullRequestEvent": {
            const payload = rawPullRequestPayloadSchema.parse(input);
            return {
                kind: "pull_request",
                action: payload.action,
                pull_request: payload.pull_request,
            };
        }
        case "PullRequestReviewEvent": {
            const payload = rawPullRequestReviewPayloadSchema.parse(input);
            return {
                kind: "pull_request_review",
                action: payload.action,
                review: payload.review,
                pull_request: payload.pull_request,
            };
        }
        case "PushEvent": {
            const payload = rawPushPayloadSchema.parse(input);
            return {
                kind: "push",
                ref: payload.ref,
                head: payload.head,
                before: payload.before,
            };
        }
        case "ReleaseEvent": {
            const payload = rawReleasePayloadSchema.parse(input);
            return {
                kind: "release",
                action: payload.action,
                release: payload.release,
            };
        }
    }
}

function decodeRawEvent(raw: RawEvent): Event | null {
    if (raw.type === null) {
        return null;
    }

    if (!isSupportedEventType(raw.type)) {
        return null;
    }

    const payload = parseAndDecodePayload(raw.type, raw.payload);

    return {
        id: raw.id,
        repo: raw.repo,
        payload,
        created_at: raw.created_at,
    };
}
