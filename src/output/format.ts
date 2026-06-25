import type { Result } from "../result.js";

export const outputFormatKinds = [
    "html",
    "markdown",
    "plain",
    "terminal",
] as const;

export type OutputFormatKind = (typeof outputFormatKinds)[number];

export const defaultOutputFormat: OutputFormatKind = "plain";

function isValidOutputFormat(value: string): value is OutputFormatKind {
    return outputFormatKinds.some((format) => format === value);
}

export const htmlTemplates = [
    "editorial",
    "notebook",
    "terminal",
    "zine",
] as const;

export type HtmlTemplate = (typeof htmlTemplates)[number];

export const defaultHtmlTemplate: HtmlTemplate = "terminal";

function isValidHtmlTemplate(value: string): value is HtmlTemplate {
    return htmlTemplates.some((template) => template === value);
}

export type OutputFormat =
    | { kind: "html"; template: HtmlTemplate }
    | { kind: "markdown" }
    | { kind: "plain" }
    | { kind: "terminal" };

export function parseOutputFormat(
    value: string,
    htmlTemplate: string,
): Result<OutputFormat, string> {
    if (!isValidOutputFormat(value)) {
        return {
            tag: "err",
            error: `invalid output format provided: '${value}'`,
        };
    }

    switch (value) {
        case "html":
            if (!isValidHtmlTemplate(htmlTemplate)) {
                return {
                    tag: "err",
                    error: `invalid html template provided: '${htmlTemplate}'`,
                };
            }

            return {
                tag: "ok",
                value: { kind: "html", template: htmlTemplate },
            };
        default:
            return { tag: "ok", value: { kind: value } };
    }
}
