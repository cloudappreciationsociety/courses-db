"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import type { UserRole } from "@/types";
import * as queries from "@/lib/queries";

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
    const netId = String(formData.get("netId") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    const user = await queries.userFromNetId(netId);

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
