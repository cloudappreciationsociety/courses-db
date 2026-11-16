import type { CareerLevel, Semester } from "@/types";
import { timeSlot as ts } from "@/db/schema";

type TimeSlot = typeof ts.$inferSelect;

const hhmm = (t: string) => t.slice(0, 5);

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sessionId(sessionId: string) {

}

export function careerLevel(careerLevel: CareerLevel) {
    return capitalizeFirstLetter(careerLevel);
}

export function semester(semester: Semester) {
    return capitalizeFirstLetter(semester);
}

export function timeSlot(timeSlot: TimeSlot) {
    return `${timeSlot.timeSlotId} ${hhmm(timeSlot.startTime)} - ${hhmm(timeSlot.endTime)}`
}