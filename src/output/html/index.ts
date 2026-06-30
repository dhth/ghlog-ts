import Handlebars from "handlebars";
import type { EventVisibility } from "../../domain/event.js";
import type { Username } from "../../domain/username.js";
import type { Result } from "../../result.js";
import type { HtmlTemplate } from "../format.js";
import type { EventPresentation } from "../presentation.js";
import {
    type Branding,
    formatUtcTimestamp,
    type HtmlContext,
    htmlEvents,
} from "./context.js";
import { getTemplate } from "./templates/index.js";

export function renderHtml(
    events: EventPresentation[],
    referenceTime: Date,
    htmlTemplate: HtmlTemplate,
    username: Username,
    eventVisibility: EventVisibility,
): Result<string, Error> {
    const templateString = getTemplate(htmlTemplate);
    let template: (context: HtmlContext) => string;
    try {
        template = Handlebars.compile<HtmlContext>(templateString);
    } catch (error) {
        return {
            tag: "err",
            error: new Error("couldn't compile built-in template", {
                cause: error,
            }),
        };
    }
    const activityLabel =
        eventVisibility === "public_only"
            ? "recent public activity"
            : "recent activity";
    const branding: Branding = {
        toolName: "ghlog-ts",
        url: "https://github.com/dhth/ghlog-ts",
    };
    const timestamp = formatUtcTimestamp(referenceTime);
    const userUrl = `https://github.com/${username}`;

    const context: HtmlContext = {
        events: htmlEvents(events),
        branding,
        activityLabel,
        timestamp,
        userUrl,
        username,
    };

    let result: string;
    try {
        result = template(context);
    } catch (error) {
        return {
            tag: "err",
            error: new Error("couldn't render built-in template", {
                cause: error,
            }),
        };
    }

    return { tag: "ok", value: result };
}
