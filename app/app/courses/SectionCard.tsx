import { fmt } from "@/utils";
import { getCourses } from "@/lib/queries";

type Section = Awaited<ReturnType<typeof getCourses>>[number]["sections"][number];

export default function SectionCard({ section: s }: { section: Section }) {
    return (
        <tr key={s.sectionId}>
            <td>{s.sectionCode}</td>
            <td>{s.component}</td>
            <td>
                {fmt.timeSlot(s)}
            </td>
            <td>
                {s.classroom
                    ? `${s.classroom.building.name}, ${s.classroom.roomNumber}`
                    : s.instructionMode}
            </td>
            <td>
                {s.teaches
                    .map((t) => `${t.instructor.appUser.firstName} ${t.instructor.appUser.lastName}`)
                    .join(", ") || "TBA"}
            </td>
            <td>
                {s.status === "canceled"
                    ? "canceled"
                    : `${Math.max(s.capacity - s.enrolledCount, 0)} left${s.waitlistCount > 0 ? ` (${s.waitlistCount} waitlisted)` : ""
                    }`}
            </td>
        </tr>
    );
}