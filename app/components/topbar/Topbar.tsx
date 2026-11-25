import { Suspense } from "react";
import styles from "./Topbar.module.css";
import Navbar from "./Navbar";
import UserStatus from "./UserStatus";

export default function Topbar() {
    return (
        <header className={styles.topbar}>
            <Navbar />
            <Suspense>
                <UserStatus />
            </Suspense>
        </header>
    )
}