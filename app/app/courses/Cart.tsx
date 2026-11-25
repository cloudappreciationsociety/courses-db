import Link from "next/link";
import { fmt, cmp } from "@/utils";
import { clearCart, removeFromCart } from "./actions";
import styles from "./Cart.module.css";
import type { CourseWithSections } from "@/lib/queries";

function CartRow({ course: c }: { course: CourseWithSections }) {
    return (
        <li key={c.courseId} className={styles.course}>
            <p className={styles.courseTitle}>
                <span className={styles.courseCode}>{c.courseId}</span>
                {c.title}
            </p>
            <p className={styles.courseMeta}>{c.credits} credits</p>

            <ul className={styles.sections}>
                {c.sections
                    .toSorted(cmp.section)
                    .map((s) => (
                        <li key={s.sectionId} className={styles.section}>
                            <div className={styles.sectionInfo}>
                                <span className={styles.sectionName}>
                                    {fmt.sectionComponent(s)} {s.sectionCode}
                                </span>
                                <span className={styles.sectionTime}>
                                    {fmt.timeSlot(s)}
                                </span>
                            </div>
                            <form action={removeFromCart}>
                                <input type="hidden" name="sectionId" value={s.sectionId} />
                                <button
                                    className={styles.remove}
                                    aria-label={`Remove ${c.courseId} ${fmt.sectionComponent(s)} ${s.sectionCode} from cart`}
                                >
                                    Remove
                                </button>
                            </form>
                        </li>
                    ))}
            </ul>
        </li>
    );
}

export default function Cart({ courses }: { courses: CourseWithSections[] }) {
    // Counted once per course, so a lecture plus its lab do not double the credits.
    const credits = courses.reduce((total, c) => total + Number(c.credits), 0);

    return (
        <section className={styles.cart}>
            <header className={styles.header}>
                <h2 id="cart-heading" className={styles.title}>
                    Shopping cart
                </h2>
            </header>

            {courses.length === 0 ? (
                <p className={styles.empty}>
                    Your cart is empty. Check the sections you want in the catalog, then press + on the course.
                </p>
            ) : (
                <>
                    <ul className={styles.courses}>
                        {courses.map((c) => (
                            <CartRow key={c.courseId} course={c} />
                        ))}
                    </ul>

                    <footer className={styles.footer}>
                        <p className={styles.total}>{credits} credits</p>
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