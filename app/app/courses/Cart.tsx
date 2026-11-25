import Link from "next/link";
import { fmt } from "@/utils";
import { clearCart, removeFromCart } from "./actions";
import styles from "./Cart.module.css";
import type { CourseWithSections } from "@/lib/queries";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default function Cart({ courses }: { courses: CourseWithSections[] }) {
    const sectionCount = courses.reduce((total, c) => total + c.sections.length, 0);
    // Counted once per course, so a lecture plus its lab do not double the credits.
    const credits = courses.reduce((total, c) => total + Number(c.credits), 0);

    return (
        <section className={styles.cart}>
            <header className={styles.header}>
                <h2 id="cart-heading" className={styles.title}>
                    Shopping cart
                </h2>
                {sectionCount > 0 && (
                    <span className={styles.count}>
                        {sectionCount} {sectionCount === 1 ? "section" : "sections"}
                    </span>
                )}
            </header>

            {courses.length === 0 ? (
                <p className={styles.empty}>
                    Your cart is empty. Check the sections you want in the catalog, then press + on the course.
                </p>
            ) : (
                <>
                    <ul className={styles.courses}>
                        {courses.map((c) => (
                            <li key={c.courseId} className={styles.course}>
                                <p className={styles.courseTitle}>
                                    <span className={styles.courseCode}>{c.courseId}</span>
                                    {c.title}
                                </p>
                                <p className={styles.courseMeta}>{c.credits} credits</p>

                                <ul className={styles.sections}>
                                    {c.sections
                                        .toSorted(
                                            (a, b) =>
                                                a.component.localeCompare(b.component) ||
                                                a.sectionCode.localeCompare(b.sectionCode),
                                        )
                                        .map((s) => (
                                            <li key={s.sectionId} className={styles.section}>
                                                <div className={styles.sectionInfo}>
                                                    <span className={styles.sectionName}>
                                                        {capitalize(s.component)} {s.sectionCode}
                                                    </span>
                                                    <span className={styles.sectionTime}>
                                                        {fmt.timeSlot(s)}
                                                    </span>
                                                </div>
                                                <form action={removeFromCart}>
                                                    <input type="hidden" name="sectionId" value={s.sectionId} />
                                                    <button
                                                        className={styles.remove}
                                                        aria-label={`Remove ${c.courseId} ${capitalize(s.component)} ${s.sectionCode} from cart`}
                                                    >
                                                        Remove
                                                    </button>
                                                </form>
                                            </li>
                                        ))}
                                </ul>
                            </li>
                        ))}
                    </ul>

                    <footer className={styles.footer}>
                        <p className={styles.total}>{credits} credits</p>
                        {/* The enrollment page (verify and enroll) does not exist yet. */}
                        <Link href="/enrollment" className={styles.enrollLink}>
                            Review and enroll
                        </Link>
                        <form action={clearCart}>
                            <button className={styles.clear}>Clear cart</button>
                        </form>
                    </footer>
                </>
            )}
        </section>
    );
}