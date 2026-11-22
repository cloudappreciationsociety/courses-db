import { verifySession } from "@/lib/dal";
import { logout } from "../login/actions";
import styles from "./page.module.css";
import type { TimeString, Day } from "@/types";
import { Suspense } from "react";
import * as queries from "@/lib/queries";
import SectionCard from "./SectionCard";
import CourseCard from "./CourseCard";

type SearchParams = {
    keywordQuery?: string;
    session?: string;
    startsAfter?: TimeString;
    endsBefore?: TimeString;
    days?: Day[];
};

function getDefaultSessionId(sessions: queries.Session[]) {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = sessions.findLast((s) => s.endDate >= today);

    return upcoming?.sessionId ?? sessions[0]?.sessionId ?? "";
}

async function CoursesContent({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
    const auth = await verifySession();

    const sessions = await queries.allSessions();

    const searchParams = await searchParamsPromise;
    const { keywordQuery = "" } = searchParams;
    // If no session was provided, use the current or latest session.
    const sessionId = searchParams.session ?? getDefaultSessionId(sessions);

    const me = await queries.userFromNetId(auth.universityId!);
    const courses = await queries.courses(keywordQuery, sessionId);

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
                    <CourseCard key={c.courseId} course={c} />
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