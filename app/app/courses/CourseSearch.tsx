"use client";

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./CourseSearch.module.css";
import { useFormStatus } from "react-dom";
import { fmt } from "@/utils";

function SearchButton({ className }: { className?: string }) {
    const { pending } = useFormStatus();
    return (
        <button className={className} disabled={pending}>
            {pending ? "Searching..." : "Search"}
        </button>
    );
}

export default function SearchForm() {
    const params = useSearchParams();

    const [query, setQuery] = useState(() => params.get("keywordQuery") ?? "");

    return (
        <Form action="/courses" className={styles.search}>
            <input
                name="keywordQuery"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or course code"
                className={styles.searchInput}
            />
            <SearchButton className={styles.searchButton} />
        </Form>
    );
}