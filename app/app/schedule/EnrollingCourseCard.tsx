import type { CourseWithSections, SectionWithDetails } from "@/lib/queries";
import styles from "./EnrollingCourseCard.module.css";
import { fmt } from "@/utils";
import { CourseTitle } from "@/components/shared/CourseCard";

function formatLocation(s: SectionWithDetails) {
    if (s.instructionMode === "online") {
        return "Online";
    }

    const mode = fmt.instructionMode(s.instructionMode);
    if (!s.classroom) {
        return mode;
    }

    return `${mode}\n${fmt.room(s)}`;
}

function EnrollingSection({ section: s }: { section: SectionWithDetails }) {
    return (
        <tr className={styles.row}>
            <th scope="row" data-label="Section" className={styles.name}>
                {fmt.sectionComponent(s)} {s.sectionCode}
            </th>
            <td data-label="Instructor">{fmt.instructors(s)}</td>
            <td data-label="Location">{formatLocation(s)}</td>
            <td data-label="Time">{fmt.timeSlot(s)}</td>
            <td data-label="Status">
                <span className={styles.status} data-status={s.status}>
                    {fmt.sectionStatusLabel(s)}
                </span>
            </td>
        </tr>
    );
}

export default function EnrollingCourseCard({ course: c }: { course: CourseWithSections }) {
    const sections = c.sections.toSorted(
        (a, b) => a.component.localeCompare(b.component) || a.sectionCode.localeCompare(b.sectionCode),
    );

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <CourseTitle course={c} />
            </header>

            <table className={styles.table}>
                <thead className={styles.columns}>
                    <tr>
                        <th scope="col">Section</th>
                        <th scope="col">Instructor</th>
                        <th scope="col">Location</th>
                        <th scope="col">Time</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sections.map((s) => (
                        <EnrollingSection key={s.sectionId} section={s} />
                    ))}
                </tbody>
            </table>
        </article>
    );
}