import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getToken(): Promise<string> {
    const tokenFromEnvVar = process.env.GHLOG_TOKEN;
    if (tokenFromEnvVar !== undefined) {
        return tokenFromEnvVar;
    }

    let token: string;
    try {
        token = await getTokenFromGh();
    } catch (error) {
        throw new Error(
            `couldn't get a GitHub authentication token

ghlog-ts tries to get this token in the following order:
- Read the environment variable GHLOG_TOKEN (this was not set)
- Running "gh auth token" (this failed)

Make sure ghlog-ts can get a token from either one of these approaches.`,
            { cause: error },
        );
    }

    return token;
}

async function getTokenFromGh(): Promise<string> {
    const { stdout } = await execFileAsync("gh", ["auth", "token"]);

    return stdout.trim();
}
