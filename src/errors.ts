export class CliValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CliValidationError";
    }
}

export function formatError(error: Error): string {
    const message = `Error: ${error.message}`;
    const causes: string[] = [];

    let current = error.cause;
    while (current !== undefined) {
        if (current instanceof Error) {
            causes.push(current.message);
            current = current.cause;
        } else {
            causes.push(String(current));
            break;
        }
    }

    if (causes.length === 0) {
        return message;
    }

    const causesLines = causes.map((cause) => `- ${cause}`).join("\n");

    return `${message}

Caused by:
${causesLines}`;
}
