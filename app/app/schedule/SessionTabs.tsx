import Link from "next/link";
import styles from "./SessionTabs.module.css";
import type { Session } from "@/lib/queries";
import { fmt } from "@/utils";

export default function SessionTabs({
    sessions,
    selectedId,
}: {
    sessions: Session[];
    selectedId: string;
}) {
    return (
        <nav aria-label="Sessions">
            <ul className={styles.tabs}>
                {sessions.map((s, i) => (
                    <li key={s.sessionId}>
                        <Link
                            href={`/schedule?session=${encodeURIComponent(s.sessionId)}`}
                            className={styles.tab}
                            aria-current={s.sessionId === selectedId ? "page" : undefined}
                        >
                            {fmt.sessionLabel(s)}
                            {(i === 0) && <span className={styles.badge}>Enrolling</span>}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}