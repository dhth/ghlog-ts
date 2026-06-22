import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type CmdResult = {
    exitCode: number;
    stdout: string;
    stderr: string;
};

// Subset of execFile failures where the child process exited normally with a
// non-zero numeric exit code. Signal termination and spawn failures are
// intentionally excluded and handled by throwing.
type NonZeroExitError = Error & {
    code: number;
    stdout?: string;
    stderr?: string;
};

export async function runCli(args: string[]): Promise<CmdResult> {
    const cmdArgs = ["dist/index.js", ...args];

    return runCommand(process.execPath, cmdArgs);
}

export function formatCmdResult(result: CmdResult): string {
    return `success: ${result.exitCode === 0}
exit_code: ${result.exitCode}
----- stdout -----
${result.stdout}
----- stderr -----
${result.stderr}
`;
}

async function runCommand(
    command: string,
    args: string[] = [],
): Promise<CmdResult> {
    try {
        const { stdout, stderr } = await execFileAsync(command, args, {
            env: buildTestEnv(),
        });
        return {
            exitCode: 0,
            stdout,
            stderr,
        };
    } catch (error) {
        if (isNonZeroExitError(error)) {
            return {
                exitCode: error.code,
                stdout: error.stdout ?? "",
                stderr: error.stderr ?? "",
            };
        }

        throw new Error("couldn't run command", {
            cause: error,
        });
    }
}

function buildTestEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    delete env.GHLOG_TOKEN;

    return env;
}

function isNonZeroExitError(error: unknown): error is NonZeroExitError {
    if (!(error instanceof Error)) {
        return false;
    }

    const candidate = error as unknown as Record<string, unknown>;

    return (
        typeof candidate.code === "number" &&
        (typeof candidate.stdout === "string" ||
            candidate.stdout === undefined) &&
        (typeof candidate.stderr === "string" || candidate.stderr === undefined)
    );
}
