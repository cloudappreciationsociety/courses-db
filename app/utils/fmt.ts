import type { CareerLevel, Semester, SectionInstructionMode } from "@/types";
import { timeSlot as ts } from "@/db/schema";

type TimeSlot = typeof ts.$inferSelect;

const hhmm = (t: string) => t.slice(0, 5);

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sessionId(sessionId: string) {

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