"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { CourseWithSections } from "@/lib/queries";
import { addToCart } from "@/app/courses/actions";
import SectionCard from "./SectionCard";
import styles from "./CourseCard.module.css";
import { Icon } from "@iconify/react";
import { cmp } from "@/utils";

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

export function CourseTitle({ course: c, showCredits = true }: { course: CourseWithSections, showCredits?: boolean }) {
    return (
        <h2 className={styles.courseTitle}>
            <span className={styles.courseCode}>
                {c.courseId} {showCredits && <span className={styles.courseCredits}>({c.credits})</span>}
            </span>
            <span className={styles.courseName}>{c.title}</span>
        </h2>
    )
}

export function SectionTable({ columnNames, children }: { columnNames: string[], children: React.ReactNode[] }) {
    return (
        <div className={styles.sections}>
            <div className={styles.sectionHeader}>
                <span />
                <span className={styles.sectionCol}>Section</span>
                {columnNames.map((name) => <span key={name}>{name}</span>)}
            </div>
            <div className={styles.sectionList}>
                {children}
            </div>
        </div>
    );
}

export default function CourseCard({ course: c }: { course: CourseWithSections }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <article className={styles.card}>
            <form action={addToCart}>
                <header className={`${styles.cardHeader} ${isExpanded ? styles.headerExpanded : ""}`}>
                    <CourseTitle course={c} />

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
                        <SectionTable columnNames={["Instructor", "Status", "Time"]}>
                            {c.sections.toSorted(cmp.section).map((s) => (
                                <SectionCard key={s.sectionId} section={s} />
                            ))}
                        </SectionTable>
                    ))
                }
            </form>
        </article>
    );
}