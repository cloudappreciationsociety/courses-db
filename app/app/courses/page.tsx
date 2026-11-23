import styles from "./page.module.css";
import { verifySession } from "@/lib/dal";
import type { TimeString, Day } from "@/types";
import { Suspense } from "react";
import * as queries from "@/lib/queries";
import CourseCard from "./CourseCard";
import CourseSearch from "./CourseSearch";
import UserStatus from "./UserStatus";

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

async function Search() {
    const sessions = await queries.allSessions();

    return (
        <CourseSearch
            sessions={sessions}
            defaultSessionId={getDefaultSessionId(sessions)}
        />
    );
}

async function normalizeSearchParams(searchParamsPromise: Promise<SearchParams>) {
    const searchParams = await searchParamsPromise;

    if (!searchParams.keywordQuery) {
        searchParams.keywordQuery = "";
    }

    if (!searchParams.session) {
        const sessions = await queries.allSessions();
        searchParams.session = getDefaultSessionId(sessions);
    }

    return searchParams
}

function LoadingCourseList() {
    return (<p className={styles.muted}>Loading courses...</p>);
}

async function CourseList({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
    const searchParams = await normalizeSearchParams(searchParamsPromise);
    const courses = await queries.courses(searchParams.keywordQuery!, searchParams.session!);

    if (courses.length === 0) {
        return (
            <p>No courses found.</p>
        );
    }

    return (
        courses.filter((c) => c.sections.length > 0).map((c) => <CourseCard key={c.courseId} course={c} />)
    );
}

function LoadingCart() {
    return (<p className={styles.muted}>Loading cart...</p>);
}

async function Cart() {
    const auth = await verifySession();
    const coursesInCart = await queries.cart(auth.universityId!)

    return (
        <div>
            <p>Hi</p>
        </div>
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
            <Suspense>
                <UserStatus />
            </Suspense>

            <div className={styles.mainContent}>
                <div className={styles.leftContainer}>
                    <Suspense>
                        <Search />
                    </Suspense>

                    <Suspense fallback={<LoadingCart />}>
                        <Cart />
                    </Suspense>
                </div>

                <div className={styles.rightContainer}>
                    <Suspense fallback={<LoadingCourseList />}>
                        <CourseList searchParamsPromise={searchParams} />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}