import { db } from "@/db";
import { or, and, eq, inArray, asc, desc, ilike } from 'drizzle-orm';
import { appUser, session, course, subject, inCart, section } from "@/db/schema";
import { cache } from 'react';

async function userFromNetId(netId: string) {
    return await db.select().from(appUser).where(eq(appUser.netId, netId)).limit(1);
}

async function userFromUniversityId(universityId: string) {
    return await db.select().from(appUser).where(eq(appUser.universityId, universityId)).limit(1);
}

// Returns all sessions, sorted by recency.
async function allSessions() {
    return await db.select().from(session).orderBy(desc(session.startDate));
}

export type Session = Awaited<ReturnType<typeof allSessions>>[number];

const sectionWithDetails = {
    classroom: {
        with: { building: true }
    },
    teaches: {
        with: { appUser: true }
    },
} as const;

async function courses(keywordQuery: string, sessionId: string) {
    return await db.query.course.findMany({
        where: (c, { or, ilike }) =>
            keywordQuery ? or(
                ilike(c.title, `%${keywordQuery}%`),
                ilike(c.courseId, `%${keywordQuery}%`),
                ilike(c.description, `%${keywordQuery}%`)
            ) : undefined,
        orderBy: (c, { asc }) => asc(c.courseId),
        with: {
            subject: true,
            sections: {
                where: (s, { eq }) => eq(s.sessionId, sessionId),
                orderBy: (s, { asc }) => [asc(s.component), asc(s.sectionCode)],
                with: sectionWithDetails
            },
        },
    });
}

// Course joined with its sections
export type CourseWithSections = Awaited<ReturnType<typeof courses>>[number];

// Section joined with classroom and instructor
export type SectionWithDetails = Awaited<ReturnType<typeof courses>>[number]["sections"][number];

// Courses 
async function cart(universityId: string) {
    const sectionIdsInCart = db
        .select({ sectionId: inCart.sectionId })
        .from(inCart)
        .where(eq(inCart.studentId, universityId));

    const courseIdsInCart = db
        .select({ courseId: section.courseId })
        .from(section)
        .where(inArray(section.sectionId, sectionIdsInCart));

    return await db.query.course.findMany({
        where: (c, { inArray }) => inArray(c.courseId, courseIdsInCart),
        orderBy: (c, { asc }) => asc(c.courseId),
        with: {
            sections: {
                where: (s, { inArray }) => inArray(s.sectionId, sectionIdsInCart),
                with: sectionWithDetails,
            },
        },
    });
}

export {
    userFromNetId,
    userFromUniversityId,
    allSessions,
    courses,
    cart
};