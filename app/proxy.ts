import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// Redirects people with no valid cookie
export async function proxy(req: NextRequest) {
    const session = await decrypt(req.cookies.get("session")?.value);
    const onLogin = req.nextUrl.pathname === "/login";

    if (!session && !onLogin) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (session && onLogin) {
        return NextResponse.redirect(new URL("/courses", req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
