import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

function isSecure(headers: Headers): boolean {
  const proto = headers.get("x-forwarded-proto") || "";
  return proto === "https";
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);
  const secure = isSecure(headers);

  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost || !secure ? "Lax" : "None",
    secure: !localhost && secure,
  };
}
