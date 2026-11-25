import Link from "next/link";
import { Suspense } from "react";
import CourseCard from "@/components/shared/CourseCard";
import { requireStudentId } from "@/lib/dal";
import * as queries from "@/lib/queries";
import Topbar from "@/components/topbar/Topbar"; // adjust if you moved it
import SessionTabs from "./SessionTabs";
import styles from "./page.module.css";

type SearchParams = { session?: string };

// Credits count once per course, and only for courses the student is in (not waitlisted or in the cart).
function totalCredits(courses: queries.EnrolledCourseWithSections[]) {
    return courses
        .filter((c) =>
            c.sections.some((s) => s.enrollment.status === "enrolled" || s.enrollment.status === "completed"),
        )
        .reduce((total, c) => total + Number(c.credits), 0);
}

function LoadingSession() {
    return <p className={styles.muted}>Loading schedule...</p>;
}

async function SessionSchedule({
    studentId,
    sessionId,
    isEnrolling,
}: {
    studentId: string;
    sessionId: string;
    isEnrolling: boolean;
}) {
    const [courses, cartCourses] = await Promise.all([
        queries.coursesTakenAtSession(studentId, sessionId),
        isEnrolling ? queries.cart(studentId) : Promise.resolve([]),
    ]);

    return (
        <>
            {courses.length > 0 && (
                <section className={styles.block}>
                    <header className={styles.blockHeader}>
                        <h2 className={styles.blockTitle}>{isEnrolling ? "My courses" : "Courses"}</h2>
                        <span className={styles.summary}>
                            {courses.length} {courses.length === 1 ? "course" : "courses"} · {totalCredits(courses)} credits
                        </span>
                    </header>
                    {courses.map((c) => (
                        <CourseCard key={c.courseId} course={c} />
                    ))}
                </section>
            )}

            {isEnrolling && (
                <section className={styles.block}>
                    <header className={styles.blockHeader}>
                        <h2 className={styles.blockTitle}>Shopping cart</h2>
                    </header>

                    {cartCourses.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <p>Your cart is empty.</p>
                            <Link href="/courses" className={styles.button}>
                                Browse courses
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className={styles.note}>These sections are in your cart but you have not enrolled in them yet.</p>
                            {cartCourses.map((c) => (
                                <CourseCard key={c.courseId} course={c} />
                            ))}
                        </>
                    )}
                </section>
            )}
        </>
    );
}

async function ScheduleContent({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
    const studentId = await requireStudentId(); // students only; admins are sent back to the catalog
    const { session } = await searchParamsPromise;

    const sessions = await queries.sessionsTaken(studentId);
    // Default to the shopping session (the first tab).
    const selected = sessions.find((t) => t.sessionId === session) ?? sessions[0];

    if (!selected) {
        return <p>No schedules found.</p>;
    }

    return (
        <>
            <SessionTabs sessions={sessions} selectedId={selected.sessionId} />

            {/* The key shows the fallback again when switching tabs, while the tab bar stays put. */}
            <Suspense key={selected.sessionId} fallback={<LoadingSession />}>
                <SessionSchedule
                    studentId={studentId}
                    sessionId={selected.sessionId}
                    isEnrolling={sessions[0] === selected}
                />
            </Suspense>
        </>
    );
}

export default function SchedulePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return (
        <main className={styles.page}>
            <Topbar />
            <h1 className={styles.title}>My Schedule</h1>

            <Suspense fallback={<LoadingSession />}>
                <ScheduleContent searchParamsPromise={searchParams} />
            </Suspense>
        </main>
    );
}