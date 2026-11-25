import { fmt } from "@/utils";
import * as queries from "@/lib/queries";
import styles from "./SectionCard.module.css";

export default function SectionCard({ section: s }: { section: queries.SectionWithDetails }) {
    const instructors =
        s.teaches
            .map(({ appUser: u }) => `${u.lastName}, ${u.firstName}`)
            .join("; ") || "TBA";
    const room = s.classroom
        ? `${s.classroom.building.name} Room ${s.classroom.roomNumber}`
        : "Online";
    const seatsLeft = Math.max(s.capacity - s.enrolledCount, 0);

    return (
        <details className={styles.card}>

            <summary className={styles.row}>
                <input type="checkbox" name="sectionId" className={styles.checkbox} value={s.sectionId} />
                <span className={styles.name}>
                    <span className={styles.chevron} aria-hidden="true" />
                    {fmt.sectionTitle(s)}
                </span>
                <span className={styles.professor}>{instructors}</span>
                <span className={styles.status} data-status={s.status}>
                    {fmt.sectionStatusLabel(s)}
                </span>
                <span className={styles.time}>{fmt.timeSlot(s)}</span>
            </summary>

            <dl className={styles.body}>
                <div className={styles.field}>
                    <dt className={styles.label}>Instruction mode</dt>
                    <dd className={styles.value}>{fmt.instructionMode(s.instructionMode)}</dd>
                </div>
                {/* {<div className={styles.field}>
                    <dt className={styles.label}>Session</dt>
                    <dd className={styles.value}>
                        {fmt.sessionDays(s.)}
                    </dd>
                </div>} */}
                <div className={styles.field}>
                    <dt className={styles.label}>Component</dt>
                    <dd className={styles.value}>{fmt.sectionComponent(s)}</dd>
                </div>
                <div className={styles.field}>
                    <dt className={styles.label}>Room</dt>
                    <dd className={styles.value}>{room}</dd>
                </div>
                <div className={styles.field}>
                    <dt className={styles.label}>Seats</dt>
                    <dd className={styles.value}>
                        {seatsLeft} of {s.capacity} available
                    </dd>
                </div>
                {s.notes && (
                    <div className={`${styles.field} ${styles.wide}`}>
                        <dt className={styles.label}>Notes</dt>
                        <dd className={styles.value}>{s.notes}</dd>
                    </div>
                )}
            </dl>
        </details>
    );
}
