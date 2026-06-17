import { getToken } from "#auth";
import { parseEventLimit } from "#domain/event.js";
import { validateUsername } from "#domain/username.js";
import { CliValidationError } from "#errors";
import { createGithubService } from "#services/github/index.js";

type RunOptions = {
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

    const token = await getToken();

    const service = createGithubService({ token });

    const events = await service.getEventsForUser(
        validatedUsername,
        validatedEventLimit,
    );

    console.log(events);
}
