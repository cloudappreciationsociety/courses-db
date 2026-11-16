import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "./session";

export const verifySession = cache(async () => {
    const session = await decrypt((await cookies()).get("session")?.value);
    if (!session) {
        redirect("/login");
    }

    return session;
});

export async function requireStudentId() {
    const session = await verifySession();
    if (session.role !== "student" || !session.universityId) {
        redirect("/courses");
    }

    return session.universityId;
}

export async function requireAdminId() {
    const session = await verifySession();
    if (session.role !== "admin" || !session.universityId) {
        redirect("/courses");
    }

    return session.universityId;
}

