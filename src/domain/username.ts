import type { Result } from "../result.js";

export type Username = string & { readonly __brand: "Username" };

export function validateUsername(value: string): Result<Username, string> {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return { tag: "err", error: "value is empty" };
    }

    return { tag: "ok", value: trimmed as Username };
}
