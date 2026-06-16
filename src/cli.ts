import { Command, Option } from "commander";
import { handleRun } from "#commands/run.js";

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
                "-l, --limit <number>",
                "Maximum number of events to show",
            ).default(20),
        )
        .addOption(
            new Option("-f, --output-format <format>", "Output format to use")
                .choices(["html", "markdown", "plain", "terminal"])
                .default("terminal"),
        )
        .addOption(
            new Option(
                "-p, --include-private",
                "Include private events when visible to the authenticated user",
            ).default(false),
        )
        .action(handleRun);
}
