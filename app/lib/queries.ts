import { db } from "@/db";

// Returns all sessions, sorted by recency.
export async function getSessions() {
    return await db.query.session.findMany({
        orderBy: (s, { desc }) => desc(s.startDate)
    });
}

export async function getCourses(keywordQuery: string, sessionId: string) {
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