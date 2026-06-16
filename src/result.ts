export type Result<T, E> = { tag: "ok"; value: T } | { tag: "err"; error: E };
