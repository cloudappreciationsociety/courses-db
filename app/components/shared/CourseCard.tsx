"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { CourseWithSections } from "@/lib/queries";
import { addToCart } from "@/app/courses/actions";
import SectionCard from "./SectionCard";
import styles from "./CourseCard.module.css";
import { Icon } from "@iconify/react";

function CartButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className={styles.cartButton}
            disabled={pending}
            title="Add checked sections to cart"
        >
            <Icon icon="carbon:shopping-cart-arrow-down" />
        </button>
    );
}

export default function CourseCard({ course: c }: { course: CourseWithSections }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <article className={styles.card}>
            <form action={addToCart}>
                <header className={`${styles.cardHeader} ${isExpanded ? styles.headerExpanded : ""}`}>
                    <h2 className={styles.courseTitle}>
                        <span className={styles.courseCode}>
                            {c.courseId} <span className={styles.courseCredits}>({c.credits})</span>
                        </span>
                        <span className={styles.courseName}>{c.title}</span>
                    </h2>

                    {isExpanded && c.description && <p className={styles.description}>{c.description}</p>}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.expandButton}
                            aria-expanded={isExpanded}
                            onClick={() => setIsExpanded((open) => !open)}
                        >
                            <span className={styles.chevron} />
                        </button>

                        {isExpanded && c.sections.length > 0 && <CartButton />}
                    </div>
                </header>

                {isExpanded &&
                    (c.sections.length === 0 ? (
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
                    ))
                }
            </form>
        </article>
    );
}