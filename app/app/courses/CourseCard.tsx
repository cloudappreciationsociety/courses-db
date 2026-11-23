import SectionCard from "./SectionCard";
import styles from "./CourseCard.module.css";
import type { CourseWithSections } from "@/lib/queries";
import { fmt } from "@/utils";

export default function CourseCard({ course: c }: { course: CourseWithSections }) {
    return (
        <article className={styles.card}>
            <header className={styles.cardHeader}>
                <h2 className={styles.courseTitle}>
                    <span className={styles.courseCode}>{c.courseId}</span>
                    {c.title}
                </h2>
                <ul className={styles.facts}>
                    <li>{c.subject.name}</li>
                    <li>{c.credits} credits</li>
                    <li>{fmt.careerLevel(c.careerLevel)}</li>
                    {c.requiresDeptConsent && <li>Department consent required</li>}
                </ul>
                {c.description && <p className={styles.description}>{c.description}</p>}

                <button type="button" className={styles.addButton} aria-label={`Add ${c.courseId} to cart`} />
            </header>

            {c.sections.length === 0 ? (
                <p className={styles.empty}>No sections this session.</p>
            ) : (
                <div className={styles.sections}>
                    <div className={styles.sectionHeader}>
                        <span />
                        <span className={styles.sectionCol}>Sections</span>
                        <span>Instructor</span>
                        <span>Status</span>
                        <span>Time</span>
                    </div>
                    {c.sections.map((s) => (
                        <SectionCard key={s.sectionId} section={s} />
                    ))}
                </div>
            )}
        </article>
    );
}