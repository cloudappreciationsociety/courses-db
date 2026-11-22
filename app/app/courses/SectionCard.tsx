import { fmt } from "@/utils";
import * as queries from "@/lib/queries";
import styles from "./SectionCard.module.css";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// "2026-09-01" -> "9/1/2026" (no Date object, so no time-zone shifts)
function shortDate(isoDate: string) {
    const [year, month, day] = isoDate.split("-");
    return `${Number(month)}/${Number(day)}/${year}`;
}

function statusLabel(s: queries.Section) {
    switch (s.status) {
        case "open":
            return "Open";
        case "waitlist":
            return `Wait List (${s.waitlistCount})`;
        case "closed":
            return "Closed";
        case "canceled":
            return "Canceled";
        default:
            return capitalize(s.status);
    }
}

export default function SectionCard({ section: s }: { section: queries.Section }) {
    const title = `${capitalize(s.component)} ${s.sectionCode}`;
    const instructors =
        s.teaches
            .map(({ instructor: { appUser: u } }) => `${u.lastName}, ${u.firstName}`)
            .join("; ") || "TBA";
    const room = s.classroom
        ? `${s.classroom.building.name} Room ${s.classroom.roomNumber}`
        : "Online";
    const seatsLeft = Math.max(s.capacity - s.enrolledCount, 0);

    return (
        <details className={styles.card}>

            <summary className={styles.row}>
                {/* Interactive content inside <summary> does not toggle the row. */}
                <input type="checkbox" className={styles.checkbox} aria-label={`Select ${title}`} />
                <span className={styles.name}>
                    <span className={styles.chevron} aria-hidden="true" />
                    {title}
                </span>
                <span className={styles.professor}>{instructors}</span>
                <span className={styles.status} data-status={s.status}>
                    {statusLabel(s)}
                </span>
                <span className={styles.time}>{fmt.timeSlot(s)}</span>
            </summary>

            <dl className={styles.body}>
                <div className={`${styles.field} ${styles.wide}`}>
                    <dt className={styles.label}>Instructor</dt>
                    <dd className={styles.value}>{instructors}</dd>
                </div>
                <div className={styles.field}>
                    <dt className={styles.label}>Instruction mode</dt>
                    <dd className={styles.value}>{fmt.instructionMode(s.instructionMode)}</dd>
                </div>
                {/* <div className={styles.field}>
                    <dt className={styles.label}>Session</dt>
                    <dd className={styles.value}>
                        {shortDate(s.session.startDate)} - {shortDate(s.session.endDate)}
                    </dd>
                </div> */}
                <div className={styles.field}>
                    <dt className={styles.label}>Component</dt>
                    <dd className={styles.value}>{capitalize(s.component)}</dd>
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
