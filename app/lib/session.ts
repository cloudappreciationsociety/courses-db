import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/types";

export interface SessionPayload extends JWTPayload {
    role: UserRole;
    universityId?: string;
}

const SESSION_DAYS = 7;

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DAYS}d`)
        .sign(key);
}

export async function decrypt(token: string | undefined) {
    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function createSession(payload: SessionPayload) {
    const token = await encrypt(payload);

    (await cookies()).set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DAYS * 24 * 60 * 60,
    });
}

export async function deleteSession() {
    (await cookies()).delete("session");
}
