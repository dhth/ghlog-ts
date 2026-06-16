import type { Event, EventLimit } from "#domain/event.js";
import type { Username } from "#domain/username.js";
import { decodeEvents } from "./decode.js";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_API_VERSION = "2026-03-10";
const GITHUB_API_MAX_PER_PAGE = 100;

export type GithubServiceDependencies = {
    token: string;
    fetchFn?: typeof fetch;
};

export type GithubService = {
    getEventsForUser(username: Username, limit: EventLimit): Promise<Event[]>;
};

export function createGithubService({
    token,
    fetchFn = fetch,
}: GithubServiceDependencies): GithubService {
    async function fetchEvents(
        username: Username,
        page: number,
    ): Promise<GithubPage> {
        const url = new URL(
            `${GITHUB_API_BASE}/users/${username}/events/public`,
        );
        url.searchParams.set("per_page", String(GITHUB_API_MAX_PER_PAGE));
        url.searchParams.set("page", String(page));

        let response: Response;
        try {
            response = await fetchFn(url, {
                headers: {
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": GITHUB_API_VERSION,
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            throw new Error("couldn't send HTTP request to GitHub", {
                cause: error,
            });
        }

        const hasNextPage = nextPageExists(response.headers);

        let body: string;
        try {
            body = await response.text();
        } catch (error) {
            throw new Error("couldn't get text from GitHub's response", {
                cause: error,
            });
        }

        if (response.status !== 200) {
            throw new Error(`GitHub returned ${response.status}: ${body}`);
        }

        let responseJson: unknown;
        try {
            responseJson = JSON.parse(body);
        } catch (error) {
            throw new Error(`couldn't parse response from GitHub as JSON`, {
                cause: error,
            });
        }

        let events: Event[];
        try {
            events = decodeEvents(responseJson);
        } catch (error) {
            throw new Error(`couldn't decode response from GitHub`, {
                cause: error,
            });
        }

        return {
            events,
            hasNextPage,
        };
    }

    return {
        async getEventsForUser(
            username: Username,
            limit: EventLimit,
        ): Promise<Event[]> {
            const collectedEvents: Event[] = [];
            let page = 1;

            while (true) {
                const responsePage = await fetchEvents(username, page);
                collectedEvents.push(...responsePage.events);

                if (collectedEvents.length >= limit) {
                    return collectedEvents.slice(0, limit);
                }

                if (!responsePage.hasNextPage) {
                    break;
                }

                page += 1;
            }

            return collectedEvents;
        },
    };
}

type GithubPage = {
    events: Event[];
    hasNextPage: boolean;
};

function nextPageExists(headers: Headers): boolean {
    const link = headers.get("link");
    if (link === null) {
        return false;
    }

    return link.split(",").some((entry) =>
        entry
            .trim()
            .split(";")
            .some((part) => part.trim() === 'rel="next"'),
    );
}
