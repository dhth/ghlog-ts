import type { HtmlTemplate } from "../../format.js";
import { templateEditorial } from "./editorial.js";
import { templateNotebook } from "./notebook.js";
import { templateTerminal } from "./terminal.js";
import { templateZine } from "./zine.js";

export function getTemplate(template: HtmlTemplate): string {
    switch (template) {
        case "editorial":
            return templateEditorial;
        case "notebook":
            return templateNotebook;
        case "terminal":
            return templateTerminal;
        case "zine":
            return templateZine;
    }
}
