import { db } from "@/db";
import { verifySession } from "@/lib/dal";
import { logout } from "../login/actions";
import styles from "./page.module.css";
import type { TimeString, Day } from "@/types";
import { Suspense } from "react";
import { getSessions, getCourses } from "@/lib/queries";
import SectionCard from "./SectionCard";

type SearchParams = {
    keywordQuery?: string;
    session?: string;
    startsAfter?: TimeString;
    endsBefore?: TimeString;
    days?: Day[];
};

type Session = Awaited<ReturnType<typeof getSessions>>[number];

const hhmm = (t: string) => t.slice(0, 5);

function getDefaultSessionId(sessions: Session[]) {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = sessions.findLast((s) => s.endDate >= today);

    return upcoming?.sessionId ?? sessions[0]?.sessionId ?? "";
}

async function CoursesContent({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
    const auth = await verifySession();

    const sessions = await getSessions();

    const searchParams = await searchParamsPromise;
    const { keywordQuery = "" } = searchParams;
    // If no session was provided, use the current or latest session.
    const sessionId = searchParams.session ?? getDefaultSessionId(sessions);

    const me = await db.query.appUser.findFirst({
        where: (u, { eq }) => eq(u.universityId, auth.universityId!),
    });

    const courses = await getCourses(keywordQuery, sessionId);

    return (
        <>
            <form action={logout}>
                <button className={styles.signOut}>
                    Sign out ({me ? `${me.firstName} ${me.lastName}` : auth.universityId}, {auth.role})
                </button>
            </form>

            <form className={styles.search} method="GET">
                <input
                    name="keywordQuery"
                    defaultValue={keywordQuery}
                    placeholder="Search title or course code"
                    className={styles.searchInput}
                />
                <select name="session" defaultValue={sessionId} className={styles.select}>
                    {sessions.map((s) => (
                        <option key={s.sessionId} value={s.sessionId}>
                            {s.semester} {s.year}
                        </option>
                    ))}
                </select>
                <button className={styles.searchButton}>Search</button>
            </form>

            {courses.length === 0 && <p>No courses match.</p>}

            {
                courses.map((c) => (
                    <section key={c.courseId} className={styles.card}>
                        <h2 className={styles.courseTitle}>
                            {c.courseId}: {c.title}
                        </h2>
                        <p className={styles.meta}>
                            {c.department.name} · {c.credits} credits
                            {c.requiresDeptConsent && " · Department consent required"}
                        </p>

                        {c.sections.length === 0 ? (
                            <p className={styles.muted}>No sections this session.</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Section</th>
                                        <th>Type</th>
                                        <th>When</th>
                                        <th>Where</th>
                                        <th>Instructor</th>
                                        <th>Seats</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {c.sections.map((s) => (
                                        <SectionCard key={s.sectionId} section={s} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                ))
            }
        </>
    );
}

export default function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    return (
        <main className={styles.page}>
            <h1 className={styles.title}>Course Catalog</h1>

            <Suspense fallback={<div>Loading courses...</div>}>
                <CoursesContent searchParamsPromise={searchParams} />
            </Suspense>
        </main>
    );
}