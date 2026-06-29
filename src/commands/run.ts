import { getToken } from "../auth.js";
import {
    type EventVisibility,
    parseEventKinds,
    parseEventLimit,
} from "../domain/event.js";
import { validateUsername } from "../domain/username.js";
import { CliValidationError } from "../errors.js";
import { type OutputFormat, parseOutputFormat } from "../output/format.js";
import { render } from "../output/index.js";
import { createGithubService } from "../services/github/index.js";

type RunOptions = {
    dryRun: boolean;
    eventType: string[];
    htmlTemplate: string;
    limit: unknown;
    outputFormat: string;
    includePrivate: boolean;
};

export async function handleRun(username: string, options: RunOptions) {
    const usernameResult = validateUsername(username);
    if (usernameResult.tag === "err") {
        throw new CliValidationError(
            `invalid username provided ('${username}'): ${usernameResult.error}`,
        );
    }
    const validatedUsername = usernameResult.value;

    const eventLimitResult = parseEventLimit(options.limit);
    if (eventLimitResult.tag === "err") {
        throw new CliValidationError(
            `invalid event limit provided ('${options.limit}'): ${eventLimitResult.error}`,
        );
    }
    const validatedEventLimit = eventLimitResult.value;

    const eventKindsResult = parseEventKinds(options.eventType);
    if (eventKindsResult.tag === "err") {
        if (eventKindsResult.error.length === 1) {
            throw new CliValidationError(
                `invalid event type provided: '${eventKindsResult.error[0]}'`,
            );
        } else {
            throw new CliValidationError(
                `invalid event types provided: [${eventKindsResult.error.join(", ")}]`,
            );
        }
    }
    const validatedEventKinds = eventKindsResult.value;

    const eventVisibility: EventVisibility = options.includePrivate
        ? "include_private"
        : "public_only";

    const outputFormatResult = parseOutputFormat(
        options.outputFormat,
        options.htmlTemplate,
    );
    if (outputFormatResult.tag === "err") {
        throw new CliValidationError(outputFormatResult.error);
    }
    const validatedOutputFormat = outputFormatResult.value;

    if (options.dryRun) {
        console.log(`command: run

- username       : ${validatedUsername}
- event types    : ${validatedEventKinds.length > 0 ? validatedEventKinds.join(", ") : "<not-provided>"}
- event limit    : ${validatedEventLimit}
- include private: ${options.includePrivate}
- output format  : ${printOutputFormat(validatedOutputFormat)}`);
        return;
    }

    const token = await getToken();

    const service = createGithubService({ token });

    const events = await service.getEventsForUser(
        validatedUsername,
        validatedEventLimit,
        validatedEventKinds,
        eventVisibility,
    );

    if (events.length === 0) {
        return;
    }

    const now = new Date();

    const outputResult = render(
        events,
        now,
        validatedOutputFormat,
        validatedUsername,
        eventVisibility,
    );
    if (outputResult.tag === "err") {
        throw new Error(`couldn't render result: ${outputResult.error}`);
    }

    console.log(outputResult.value);
}

function printOutputFormat(format: OutputFormat): string {
    switch (format.kind) {
        case "html":
            return `html (template: ${format.template})`;
        default:
            return format.kind;
    }
}
