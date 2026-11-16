"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { appUser } from "@/db/schema";
import { createSession, deleteSession } from "@/lib/session";
import type { UserRole } from "@/types";

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
    const netId = String(formData.get("netId") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    const [user] = await db.select().from(appUser).where(eq(appUser.netId, netId));

    if (!user) {
        return { error: "Invalid Net ID." };
    }

    const isPasswordOk = await bcrypt.compare(password, user.password);

    if (!isPasswordOk) {
        return { error: "Invalid password." };
    }


    await createSession({
        role: user.role as UserRole,
        universityId: user.universityId
    });

    redirect("/courses");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
