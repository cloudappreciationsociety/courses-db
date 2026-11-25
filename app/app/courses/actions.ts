"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { inCart, section } from "@/db/schema";
import { requireStudentId } from "@/lib/dal";

// Pulls every <input name="sectionId"> out of a submitted form.
function sectionIdsFrom(formData: FormData) {
    const ids = formData
        .getAll("sectionId")
        .map((value) => Number(value))
        .filter((id) => Number.isInteger(id) && id > 0);
    return [...new Set(ids)];
}

// The cart shows on the catalog now and on the enrollment page later.
function refreshCartViews() {
    revalidatePath("/courses");
    revalidatePath("/enrollment");
}

// Adds every checked section
export async function addToCart(formData: FormData) {
    const studentId = await requireStudentId();
    const requested = sectionIdsFrom(formData);
    if (requested.length === 0) {
        return;
    }

    const existing = await db
        .select({ sectionId: section.sectionId })
        .from(section)
        .where(inArray(section.sectionId, requested));
    if (existing.length === 0) {
        return;
    }

    await db
        .insert(inCart)
        .values(existing.map(({ sectionId }) => ({ studentId, sectionId })))
        .onConflictDoNothing(); // Already in the cart: nothing to do

    refreshCartViews();
}

export async function removeFromCart(formData: FormData) {
    const studentId = await requireStudentId();
    const sectionIds = sectionIdsFrom(formData);
    if (sectionIds.length === 0) {
        return;
    }

    await db
        .delete(inCart)
        .where(and(eq(inCart.studentId, studentId), inArray(inCart.sectionId, sectionIds)));

    refreshCartViews();
}

export async function clearCart() {
    const studentId = await requireStudentId();

    await db.delete(inCart).where(eq(inCart.studentId, studentId));

    refreshCartViews();
}