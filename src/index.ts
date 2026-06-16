#!/usr/bin/env node

import { formatError } from "./errors.js";
import { run } from "./run.js";

async function main() {
    try {
        await run();
    } catch (error) {
        if (error instanceof Error) {
            console.error(formatError(error));
        } else {
            console.error(String(error));
        }
        process.exitCode = 1;
    }
}

await main();
