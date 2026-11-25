import { verifySession } from "@/lib/dal";
import { logout } from "@/app/login/actions";
import styles from "./UserStatus.module.css";
import * as queries from "@/lib/queries";
import { fmt } from "@/utils";

function SignOut() {
    return (
        <form action={logout}>
            <button className={styles.signOut}>
                Sign out
            </button>
        </form>
    );
}

export default async function UserStatus() {
    const auth = await verifySession();
    const [me] = await queries.userFromUniversityId(auth.universityId!);

    return (
        <div className={styles.container}>
            <h3>
                {`${me ? `${me.firstName} ${me.lastName}` : auth.universityId} (${fmt.userRole(auth.role)})`}
            </h3>
            <SignOut />
        </div>
    );
}