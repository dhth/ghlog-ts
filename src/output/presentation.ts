import type {
    Event,
    EventKind,
    PullRequest,
    Release,
    Repo,
} from "../domain/event.js";

export type Fragment = {
    text: string;
    url?: string;
    detail?: string;
};

export type Color = "gray" | "blue" | "green" | "yellow" | "purple" | "red";

export type EventPresentation = {
    createdAt: Date;
    kind: EventKind;
    fragments: Fragment[];
};

export function toEventPresentation(event: Event): EventPresentation {
    const repo = event.repo;
    const payload = event.payload;

    switch (payload.kind) {
        case "create":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    text("created"),
                    text(payload.ref_type),
                    link(
                        gitRefName(payload.ref),
                        repoUrlFor(repo, gitRefPath(payload.ref)),
                    ),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
        case "delete":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    text("deleted"),
                    text(payload.ref_type),
                    text(gitRefName(payload.ref)),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
        case "issue_comment":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    link("commented on", payload.comment.html_url),
                    text(payload.issue.pull_request ? "pull request" : "issue"),
                    linkWithDetail(
                        `#${payload.issue.number}`,
                        payload.issue.html_url,
                        payload.issue.title,
                    ),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
        case "issues":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    text(payload.action),
                    text("issue"),
                    linkWithDetail(
                        `#${payload.issue.number}`,
                        payload.issue.html_url,
                        payload.issue.title,
                    ),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
        case "pull_request_review":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    link(
                        pullRequestReviewVerb(
                            payload.action,
                            payload.review.state,
                        ),
                        payload.review.html_url,
                    ),
                    text("pull request"),
                    linkWithDetail(
                        `#${payload.pull_request.number}`,
                        repoUrlFor(
                            repo,
                            pullRequestPath(payload.pull_request.number),
                        ),
                        pullRequestRefs(payload.pull_request),
                    ),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
        case "pull_request":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    text(payload.action),
                    text("pull request"),
                    linkWithDetail(
                        `#${payload.pull_request.number}`,
                        repoUrlFor(
                            repo,
                            pullRequestPath(payload.pull_request.number),
                        ),
                        pullRequestRefs(payload.pull_request),
                    ),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
        case "push":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    text("pushed"),
                    link(
                        shortCommitHash(payload.head),
                        repoUrlFor(repo, commitPath(payload.head)),
                    ),
                    text("to"),
                    link(
                        gitRefName(payload.ref),
                        repoUrlFor(repo, gitRefPath(payload.ref)),
                    ),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
        case "release":
            return {
                createdAt: event.created_at,
                kind: payload.kind,
                fragments: [
                    text(payload.action),
                    text(releaseKind(payload.release)),
                    link(payload.release.tag_name, payload.release.html_url),
                    text("in"),
                    link(repo.name, repoHtmlUrl(repo)),
                ],
            };
    }
}

export function humanizedTime(time: Date, referenceTime: Date): string {
    const durationMs = referenceTime.getTime() - time.getTime();
    const seconds = Math.floor(durationMs / 1000);

    if (seconds < 0) {
        return "-";
    }
    if (seconds < 60) {
        return "just now";
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function text(text: string): Fragment {
    return {
        text,
    };
}

export function eventColor(kind: EventKind): Color {
    switch (kind) {
        case "create":
            return "green";
        case "delete":
            return "red";
        case "issue_comment":
            return "yellow";
        case "issues":
            return "yellow";
        case "pull_request":
            return "purple";
        case "pull_request_review":
            return "purple";
        case "push":
            return "blue";
        case "release":
            return "green";
    }
}

function link(text: string, url: string): Fragment {
    return {
        text,
        url,
    };
}

function linkWithDetail(text: string, url: string, detail: string): Fragment {
    return {
        text,
        url,
        detail,
    };
}

function gitRefName(ref: string): string {
    const prefixes = ["refs/heads/", "refs/tags/"];

    for (const prefix of prefixes) {
        if (ref.startsWith(prefix)) {
            return ref.slice(prefix.length);
        }
    }

    return ref;
}

function gitRefPath(ref: string): string {
    return `tree/${gitRefName(ref)}`;
}

function shortCommitHash(hash: string): string {
    return hash.slice(0, 7);
}

function commitPath(hash: string): string {
    return `commit/${hash}`;
}

function pullRequestPath(number: number): string {
    return `pull/${number}`;
}

function pullRequestRefs(pullRequest: PullRequest): string {
    return `${pullRequest.base.repo.name}:${pullRequest.base.ref} ← ${pullRequest.head.repo.name}:${pullRequest.head.ref}`;
}

function releaseKind(release: Release): string {
    if (release.draft) {
        return "draft release";
    }

    if (release.prerelease) {
        return "prerelease";
    }

    return "release";
}

function pullRequestReviewVerb(action: string, state: string): string {
    switch (action) {
        case "created":
            switch (state) {
                case "approved":
                    return "approved";
                case "changes_requested":
                    return "requested changes in";
                case "commented":
                    return "commented on";
                default:
                    return "reviewed";
            }
        case "dismissed":
            return "dismissed review on";
        case "edited":
            return "edited review on";
        default:
            return "reviewed";
    }
}

function repoHtmlUrl(repo: Repo): string {
    return `https://github.com/${repo.name}`;
}

function repoUrlFor(repo: Repo, path: string): string {
    return `${repoHtmlUrl(repo)}/${path}`;
}
