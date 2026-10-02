import { NextResponse, type NextRequest } from "next/server";

/**
 * 내부 관리화면 Basic Auth.
 * DASHBOARD_BASIC_AUTH_USER / DASHBOARD_BASIC_AUTH_PASSWORD 가 설정되면 모든 요청(서버 액션 포함)에 적용.
 * 로컬 개발에서 비워두면 인증 없이 열린다 (프로덕션에서는 반드시 설정).
 */
export function proxy(request: NextRequest) {
  const user = process.env.DASHBOARD_BASIC_AUTH_USER;
  const password = process.env.DASHBOARD_BASIC_AUTH_PASSWORD;
  if (!user || !password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Dashboard auth is not configured", { status: 503 });
    }
    return NextResponse.next();
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const sep = decoded.indexOf(":");
    if (sep >= 0 && timingSafeEqual(decoded.slice(0, sep), user) && timingSafeEqual(decoded.slice(sep + 1), password)) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="freelance-radar", charset="UTF-8"' },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
