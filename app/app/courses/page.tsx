import styles from "./page.module.css";
import { verifySession } from "@/lib/dal";
import type { TimeString, Day } from "@/types";
import { Suspense } from "react";
import * as queries from "@/lib/queries";
import CourseCard from "@/components/shared/CourseCard";
import Cart from "./Cart";
import CourseSearch from "./CourseSearch";
import Topbar from "@/components/topbar/Topbar";

type SearchParams = {
    keywordQuery?: string;
    session?: string;
    startsAfter?: TimeString;
    endsBefore?: TimeString;
    days?: Day[];
};

function getDefaultSessionId(sessions: queries.Session[]) {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = sessions.find((s) => s.endDate >= today);

    return upcoming?.sessionId ?? sessions[0]?.sessionId ?? "";
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

async function AsyncCourseList({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
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

async function AsyncCart() {
    const auth = await verifySession();
    // Only students have a cart.
    if (auth.role !== "student") {
        return null;
    }

    const coursesInCart = await queries.cart(auth.universityId!);

    return <Cart courses={coursesInCart} />;
}

export default function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    return (
        <main className={styles.page}>
            <Topbar />
            <h1 className={styles.title}>Course Catalog</h1>

            <div className={styles.mainContent}>
                <div className={styles.leftContainer}>
                    <Suspense>
                        <CourseSearch />
                    </Suspense>

                    <Suspense fallback={<LoadingCart />}>
                        <AsyncCart />
                    </Suspense>
                </div>

                <div className={styles.rightContainer}>
                    <Suspense fallback={<LoadingCourseList />}>
                        <AsyncCourseList searchParamsPromise={searchParams} />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}