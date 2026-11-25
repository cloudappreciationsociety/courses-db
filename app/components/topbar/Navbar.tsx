"use client"

import styles from "./Navbar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/schedule", label: "Schedule" }
];

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <nav className={styles.nav}>
            {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={styles.navLink}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}