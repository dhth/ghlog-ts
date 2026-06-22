import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type CmdResult = {
    exitCode: number;
    stdout: string;
    stderr: string;
};

type ExecFileError = Error & {
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
        if (isExecFileError(error)) {
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

function isExecFileError(error: unknown): error is ExecFileError {
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
