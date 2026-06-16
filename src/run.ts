import { buildCli } from "./cli.js";

export async function run() {
    const cli = buildCli();
    await cli.parseAsync();
}
