import { Command, Option } from "commander";
import { handleRun } from "./commands/run.js";
import { eventKinds } from "./domain/event.js";

export function buildCli(): Command {
    const program = new Command();

    program
        .name("ghlog-ts")
        .description(
            "ghlog-ts lets you view a GitHub user's recent public activity",
        );

    program.addCommand(buildRunCommand());

    return program;
}

function buildRunCommand(): Command {
    return new Command("run")
        .description("Fetch and display events for a GitHub user")
        .argument("<username>", "GitHub username to run for")
        .addOption(
            new Option(
                "-e, --event-type <event-type>",
                `Filter by event type; repeat to include multiple types. Limit applies after filtering. [possible values: ${eventKinds.join(", ")}]`,
            )
                .argParser(collectEventTypes)
                .default([]),
        )
        .addOption(
            new Option(
                "-p, --include-private",
                "Include private events when visible to the authenticated user",
            ).default(false),
        )
        .addOption(
            new Option(
                "-l, --limit <number>",
                "Maximum number of events to show",
            ).default(20),
        )
        .addOption(
            new Option("-f, --output-format <format>", "Output format to use")
                .choices(["html", "markdown", "plain", "terminal"])
                .default("terminal"),
        )
        .action(handleRun);
}

function collectEventTypes(value: string, previous: string[]): string[] {
    if (previous.includes(value)) {
        return previous;
    }

    return previous.concat([value]);
}
