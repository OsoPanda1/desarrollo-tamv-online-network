/**
 * Resolve a post-authentication return target to a same-origin path.
 * Reject protocol-relative and backslash-normalized URLs to prevent open redirects.
 */
export function resolveInternalRedirect(value?: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes(String.fromCharCode(92))) {
    return "/portal"
  }

  try {
    const url = new URL(value, "https://tamv.invalid")
    if (url.origin !== "https://tamv.invalid") return "/portal"
    if (url.pathname === "/sign-in" || url.pathname === "/sign-up") return "/portal"
    return url.pathname + url.search + url.hash
  } catch {
    return "/portal"
  }
}
