// ULTRA-MINIMAL MIDDLEWARE - Testing Edge Runtime compatibility
// If this fails, the issue is Sentry or another Next.js plugin

export function middleware() {
  return Response.json({ ok: true });
}
