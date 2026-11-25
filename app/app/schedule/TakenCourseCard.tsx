import type { EnrolledCourseWithSections } from "@/lib/queries";
import { cmp, fmt } from "@/utils";
import styles from "./TakenCourseCard.module.css";
import { CourseTitle } from "@/components/shared/CourseCard";

export default function TakenCourseCard({ course: c }: { course: EnrolledCourseWithSections }) {
    const grade = c.sections[0].enrollment.grade;

    return (
        <li className={styles.course}>
            <header className={styles.header}>
                <CourseTitle course={c} />
                <span className={grade ? styles.grade : styles.noGrade}>{grade || "No grade"}</span>
            </header>

            <ul className={styles.sections}>
                {c.sections.toSorted(cmp.section).map((s) => {
                    const name = `${fmt.sectionComponent(s)} ${s.sectionCode}`;
                    const instructors = fmt.instructors(s);

                    return (
                        <li key={s.sectionId} className={styles.section} title={`${name} - ${instructors}`}>
                            <span className={styles.sectionName}>{name}</span> - {instructors}
                        </li>
                    );
                })}
            </ul>
        </li>
    );
}