import { db } from "@/db";

async function userFromNetId(netId: string) {
    return await db.query.appUser.findFirst({
        where: (u, { eq }) => eq(u.netId, netId)
    });
}

async function userFromUniversityId(universityId: string) {
    return await db.query.appUser.findFirst({
        where: (u, { eq }) => eq(u.universityId, universityId)
    });
}

// Returns all sessions, sorted by recency.
async function allSessions() {
    return await db.query.session.findMany({
        orderBy: (s, { desc }) => desc(s.startDate)
    });
}

export type Session = Awaited<ReturnType<typeof allSessions>>[number];

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
            department: true,
            sections: {
                where: (s, { eq }) => eq(s.sessionId, sessionId),
                orderBy: (s, { asc }) => [asc(s.component), asc(s.sectionCode)],
                with: {
                    classroom: { with: { building: true } },
                    teaches: { with: { instructor: { with: { appUser: true } } } },
                },
            },
        },
    });

}

// Course joined with its sections
export type CourseWithSections = Awaited<ReturnType<typeof courses>>[number];

// Section joined with classroom and instructor
export type Section = Awaited<ReturnType<typeof courses>>[number]["sections"][number];

export {
    userFromNetId,
    userFromUniversityId,
    allSessions,
    courses
};