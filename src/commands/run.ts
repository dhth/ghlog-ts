import { getToken } from "../auth.js";
import {
    type EventVisibility,
    parseEventKinds,
    parseEventLimit,
} from "../domain/event.js";
import { validateUsername } from "../domain/username.js";
import { CliValidationError } from "../errors.js";
import { createGithubService } from "../services/github/index.js";

type RunOptions = {
    eventType: string[];
    limit: string;
    outputFormat: string;
    includePrivate: boolean;
};

export async function handleRun(username: string, options: RunOptions) {
    const usernameResult = validateUsername(username);
    if (usernameResult.tag === "err") {
        throw new CliValidationError(
            `invalid username provided (\`${username}\`): ${usernameResult.error}`,
        );
    }
    const validatedUsername = usernameResult.value;

    const eventLimitResult = parseEventLimit(options.limit);
    if (eventLimitResult.tag === "err") {
        throw new CliValidationError(
            `invalid event limit provided (\`${options.limit}\`): ${eventLimitResult.error}`,
        );
    }
    const validatedEventLimit = eventLimitResult.value;

    const eventKindsResult = parseEventKinds(options.eventType);
    if (eventKindsResult.tag === "err") {
        if (eventKindsResult.error.length === 1) {
            throw new CliValidationError(
                `invalid event kind provided: ${eventKindsResult.error[0]}`,
            );
        } else {
            throw new CliValidationError(
                `invalid event kinds provided: [${eventKindsResult.error.join(", ")}]`,
            );
        }
    }
    const validatedEventKinds = eventKindsResult.value;

    const eventVisibility: EventVisibility = options.includePrivate
        ? "include_private"
        : "public_only";

    const token = await getToken();

    const service = createGithubService({ token });

    const events = await service.getEventsForUser(
        validatedUsername,
        validatedEventLimit,
        validatedEventKinds,
        eventVisibility,
    );

    if (events.length > 0) {
        console.log(events);
    }
}
