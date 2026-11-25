import type { Semester, SectionInstructionMode } from "@/types";
import { timeSlot as ts, session as s } from "@/db/schema";
import type { SectionWithDetails } from "@/lib/queries";

type TimeSlot = typeof ts.$inferSelect;
type Session = typeof s.$inferSelect;

const hhmm = (t: string) => t.slice(0, 5);

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sectionComponent(s: SectionWithDetails) {
    return capitalizeFirstLetter(s.component);
}

export function sectionTitle(s: SectionWithDetails) {
    return `${sectionComponent(s)} ${s.sectionCode}`
}

export function sectionStatusLabel(s: SectionWithDetails) {
    switch (s.status) {
        case "open":
            return "Open";
        case "waitlist":
            return `Wait List (${s.waitlistCount})`;
        case "closed":
            return "Closed";
        case "canceled":
            return "Canceled";
        default:
            return capitalizeFirstLetter(s.status);
    }
}

export function sessionLabel(session: Session) {
    return `${capitalizeFirstLetter(session.semester)} ${session.year}`
}

// "2026-09-01" -> "9/1/2026" (no Date object, so no time-zone shifts)
function shortDate(isoDate: string) {
    const [year, month, day] = isoDate.split("-");
    return `${Number(month)}/${Number(day)}/${year}`;
}

export function sessionDays(session: Session) {
    return `${shortDate(session.startDate)}-${shortDate(session.endDate)}`
}

const MODE_LABELS: Record<SectionInstructionMode, string> = {
    in_person: "In-Person",
    online: "Online",
    hybrid: "Hybrid",
};

export function instructionMode(mode: string) {
    return MODE_LABELS[mode as SectionInstructionMode];
}

export function careerLevel(careerLevel: string) {
    return capitalizeFirstLetter(careerLevel);
}

export function semester(semester: Semester) {
    return capitalizeFirstLetter(semester);
}

export function timeSlot(timeSlot: TimeSlot) {
    return `${timeSlot.timeSlotId} ${hhmm(timeSlot.startTime)} - ${hhmm(timeSlot.endTime)}`
}

export function userRole(role: string) {
    return capitalizeFirstLetter(role);
}

export function instructors(s: SectionWithDetails) {
    return s.teaches
        .map(({ appUser: u }) => `${u.lastName}, ${u.firstName}`)
        .join("; ") || "TBA";
}

export function room(s: SectionWithDetails) {
    return s.classroom
        ? `${s.classroom.building.name} Room ${s.classroom.roomNumber}`
        : "Online";
}