import { db } from "@/db";
import { or, and, eq, inArray, asc, desc, ilike, ne } from 'drizzle-orm';
import { appUser, session, course, subject, inCart, section, takes } from "@/db/schema";
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
export type SectionWithDetails = CourseWithSections["sections"][number];

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
            subject: true,
            sections: {
                where: (s, { inArray }) => inArray(s.sectionId, sectionIdsInCart),
                with: sectionWithDetails,
            },
        },
    });
}

// Returns an array of all sessions that we've either taken or are enrolling for.
// The one we're presently enrolling for is the first element
async function sessionsTaken(universityId: string) {
    const sessions = await allSessions();
    const enrollingId = sessions[0]?.sessionId;

    const rows = await db
        .selectDistinct({ sessionId: section.sessionId })
        .from(takes)
        .innerJoin(section, eq(section.sectionId, takes.sectionId))
        .where(eq(takes.studentId, universityId));

    const enrolledSessions = new Set(rows.map((r) => r.sessionId));

    return sessions
        .filter((s) => s.sessionId === enrollingId || enrolledSessions.has(s.sessionId));
}

async function coursesTakenAtSession(universityId: string, sessionId: string) {
    // All sections we took from that session (not dropped)
    const sectionsInSession = db
        .select({ sectionId: takes.sectionId })
        .from(takes)
        .innerJoin(section, eq(section.sectionId, takes.sectionId))
        .where(and(
            eq(takes.studentId, universityId),
            eq(section.sessionId, sessionId),
            ne(takes.status, "dropped")
        ));

    // All distinct course IDs from the sections we took
    const coursesInSession = db
        .select({ courseId: section.courseId })
        .from(section)
        .where(inArray(section.sectionId, sectionsInSession));

    // Join them together
    const coursesWithSections = await db.query.course.findMany({
        where: (c, { inArray }) => inArray(c.courseId, coursesInSession),
        orderBy: (c, { asc }) => asc(c.courseId),
        with: {
            subject: true,
            sections: {
                where: (s, { inArray }) => inArray(s.sectionId, sectionsInSession),
                with: {
                    ...sectionWithDetails,
                    takes: {
                        where: (t, { eq }) => eq(t.studentId, universityId)
                    }
                },
            },
        },
    });

    // "takes" will be a one-element array containing our record. Flatten it.
    return coursesWithSections.map(({ sections, ...course }) => ({
        ...course,
        sections: sections.map(({ takes: [record], ...section }) => ({
            ...section,
            enrollment: {
                status: record.status,
                waitlistPosition: record.waitlistPosition,
                grade: record.grade
            }
        }))
    }));
}

export type EnrolledCourseWithSections = Awaited<ReturnType<typeof coursesTakenAtSession>>[number];
export type EnrolledSectionWithDetails = EnrolledCourseWithSections["sections"][number];

export {
    userFromNetId,
    userFromUniversityId,
    allSessions,
    courses,
    cart,
    sessionsTaken,
    coursesTakenAtSession
};