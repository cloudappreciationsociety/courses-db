"use client";

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./CourseSearch.module.css";
import { useFormStatus } from "react-dom";
import type { Session } from "@/lib/queries";
import { fmt } from "@/utils";

function SearchButton({ className }: { className?: string }) {
    const { pending } = useFormStatus();
    return (
        <button className={className} disabled={pending}>
            {pending ? "Searching..." : "Search"}
        </button>
    );
}

export default function SearchForm({
    sessions,
    defaultSessionId,
}: {
    sessions: Session[];
    defaultSessionId: string;
}) {
    const params = useSearchParams();

    const [query, setQuery] = useState(() => params.get("keywordQuery") ?? "");
    const [sessionId, setSessionId] = useState(
        () => params.get("session") ?? defaultSessionId
    );

    return (
        <Form action="/courses" className={styles.search}>
            <input
                name="keywordQuery"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or course code"
                className={styles.searchInput}
            />
            <select
                name="session"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className={styles.select}
            >
                {sessions.map((s) => (
                    <option key={s.sessionId} value={s.sessionId}>
                        {fmt.sessionLabel(s)}
                    </option>
                ))}
            </select>
            <SearchButton className={styles.searchButton} />
        </Form>
    );
}