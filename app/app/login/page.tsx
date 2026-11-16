"use client";

import { useActionState } from "react";
import { login } from "./actions";
import styles from "./page.module.css";

export default function Login() {
    const [state, formAction, pending] = useActionState(login, undefined);

    return (
        <main className={styles.page}>
            <h1 className={styles.title}>Sign in</h1>
            <form action={formAction} className={styles.form}>
                <label className={styles.field}>
                    Net ID
                    <input name="netId" required autoComplete="username" className={styles.input} />
                </label>
                <label className={styles.field}>
                    Password
                    <input
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className={styles.input}
                    />
                </label>
                {state?.error && <p className={styles.error}>{state.error}</p>}
                <button type="submit" disabled={pending} className={styles.button}>
                    {pending ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </main>
    );
}