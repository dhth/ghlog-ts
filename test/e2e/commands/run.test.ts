import { describe, expect, it } from "vitest";
import { formatCmdResult, runCli } from "../helpers/cmd.js";

describe("run command", () => {
    //-------------//
    //  SUCCESSES  //
    //-------------//
    it("shows help", async () => {
        // GIVEN
        const args = ["run", "--help"];

        // WHEN

        const result = await runCli(args);

        // THEN
        const snapshot = formatCmdResult(result);
        expect(snapshot).toMatchInlineSnapshot(`
          "success: true
          exit_code: 0
          ----- stdout -----
          Usage: ghlog-ts run [options] <username>

          Fetch and display events for a GitHub user

          Arguments:
            username                       GitHub username to run for

          Options:
            -d, --dry-run                  Print debug information without doing anything
                                           (default: false)
            -e, --event-type <event-type>  Filter by event type; repeat to include
                                           multiple types. Limit applies after filtering.
                                           [possible values: create, delete,
                                           issue_comment, issues, pull_request_review,
                                           pull_request, push, release] (default: [])
            --html-template <template>     HTML template to use (choices: "editorial",
                                           "notebook", "terminal", "zine", default:
                                           "terminal")
            -p, --include-private          Include private events when visible to the
                                           authenticated user (default: false)
            -l, --limit <number>           Maximum number of events to show (default: 20)
            -f, --output-format <format>   Output format to use (choices: "html",
                                           "markdown", "plain", "terminal", default:
                                           "plain")
            -h, --help                     display help for command

          ----- stderr -----

          "
        `);
    });

    it("works as expected with default flags", async () => {
        // GIVEN
        const args = ["run", "username", "--dry-run"];

        // WHEN
        const result = await runCli(args);

        // THEN
        const snapshot = formatCmdResult(result);
        expect(snapshot).toMatchInlineSnapshot(`
          "success: true
          exit_code: 0
          ----- stdout -----
          command: run

          - username       : username
          - event types    : <not-provided>
          - event limit    : 20
          - include private: false
          - output format  : plain

          ----- stderr -----

          "
        `);
    });

    it("works as expected for overridden flags", async () => {
        // GIVEN
        const args = [
            "run",
            "username",
            "--event-type",
            "create",
            "--event-type",
            "push",
            "--include-private",
            "--limit",
            "50",
            "--dry-run",
        ];

        // WHEN
        const result = await runCli(args);

        // THEN
        const snapshot = formatCmdResult(result);
        expect(snapshot).toMatchInlineSnapshot(`
          "success: true
          exit_code: 0
          ----- stdout -----
          command: run

          - username       : username
          - event types    : create, push
          - event limit    : 50
          - include private: true
          - output format  : plain

          ----- stderr -----

          "
        `);
    });

    //------------//
    //  FAILURES  //
    //------------//

    it("fails is username is not provided", async () => {
        // GIVEN
        const args = ["run"];

        // WHEN
        const result = await runCli(args);

        // THEN
        const snapshot = formatCmdResult(result);
        expect(snapshot).toMatchInlineSnapshot(`
              "success: false
              exit_code: 1
              ----- stdout -----

              ----- stderr -----
              error: missing required argument 'username'

              "
            `);
    });

    it("fails is invalid event type provided", async () => {
        // GIVEN
        const args = ["run", "username", "--event-type", "unsupported"];

        // WHEN
        const result = await runCli(args);

        // THEN
        const snapshot = formatCmdResult(result);
        expect(snapshot).toMatchInlineSnapshot(`
              "success: false
              exit_code: 1
              ----- stdout -----

              ----- stderr -----
              Error: invalid event type provided: 'unsupported'

              "
            `);
    });

    it("fails is multiple invalid event types provided", async () => {
        // GIVEN
        const args = [
            "run",
            "username",
            "--event-type",
            "unsupported",
            "--event-type",
            "also-unsupported",
        ];

        // WHEN
        const result = await runCli(args);

        // THEN
        const snapshot = formatCmdResult(result);
        expect(snapshot).toMatchInlineSnapshot(`
              "success: false
              exit_code: 1
              ----- stdout -----

              ----- stderr -----
              Error: invalid event types provided: [unsupported, also-unsupported]

              "
            `);
    });

    it("fails is invalid event limit provided", async () => {
        // GIVEN
        const args = ["run", "username", "--limit", "not-a-number"];

        // WHEN
        const result = await runCli(args);

        // THEN
        const snapshot = formatCmdResult(result);
        expect(snapshot).toMatchInlineSnapshot(`
              "success: false
              exit_code: 1
              ----- stdout -----

              ----- stderr -----
              Error: invalid event limit provided ('not-a-number'): value must be a number

              "
            `);
    });
});
