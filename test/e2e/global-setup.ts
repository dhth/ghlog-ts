import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function setup() {
    try {
        await execFileAsync("npm", ["run", "build"]);
    } catch (error) {
        throw new Error("couldn't build project (required to run E2E tests)", {
            cause: error,
        });
    }
}
